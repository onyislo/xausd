import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useChat() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. Get Authentication
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  // 2. Fetch Channels & Subscribe to new ones
  useEffect(() => {
    if (!currentUser) return;
    const fetchChannels = async () => {
      const { data: channels } = await supabase.from('channels').select('*').order('created_at', { ascending: false });
      if (channels) {
        setChatData(channels.map(c => ({
          id: c.id,
          type: c.type,
          name: c.name || (c.type === 'dm' ? 'Direct Message' : 'Secure Channel'),
          created_by: c.created_by,
          status: 'Encrypted Link Active',
          lastMsg: 'Connect to begin sync',
          time: 'Active',
          messages: []
        })));
        if (channels.length > 0 && !activeId) setActiveId(channels[0].id);
      }
    };

    fetchChannels();

    const channelSub = supabase.channel('channels_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'channels' }, (payload) => {
        const c = payload.new as any;
        setChatData(prev => {
          if (prev.some(ch => ch.id === c.id)) return prev; // skip duplicate
          return [{ id: c.id, type: c.type, name: c.name || 'Secure Channel', created_by: c.created_by, status: 'Encrypted Link Active', lastMsg: 'Channel Initialized', time: 'Just now', messages: [] }, ...prev];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'channels' }, (payload) => {
        setChatData(prev => prev.filter(ch => ch.id !== payload.old.id));
        if (activeId === payload.old.id) setActiveId(null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channelSub); };
  }, [currentUser]); // Removed activeId to prevent reset

  // 3. Real-time Subscription for Messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel('realtime_comms')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const newMsg = payload.new as any;
        
        setChatData(prev => prev.map(chat => {
          if (chat.id === newMsg.channel_id) {
            const formatted = {
              sender: newMsg.user_id === currentUser.id ? 'User' : 'Contact',
              text: newMsg.content,
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            // Smarter duplicate check: if the text and sender and time (within the same minute) match, skip
            const isDuplicate = chat.messages.some((m: any) => 
              m.text === formatted.text && 
              m.sender === formatted.sender &&
              m.time === formatted.time
            );

            if (isDuplicate) return chat;

            return {
              ...chat,
              messages: [...(chat.messages || []), formatted],
              lastMsg: formatted.text.length > 30 ? formatted.text.substring(0, 30) + '...' : formatted.text,
              time: 'Just now'
            };
          }
          return chat;
        }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  // 4. Fetch Messages for Active Channel
  useEffect(() => {
    if (!activeId || !currentUser) return;

    const fetchMsgs = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', activeId)
        .order('created_at', { ascending: true });

      if (messages && !error) {
        setChatData(prev => prev.map(chat => {
          if (chat.id === activeId) {
            // Merge messages: Keep all database messages, and add optimistic ones that aren't in the DB yet
            const dbMessages = messages.map(m => ({
              id: m.id, // Keep the real ID
              sender: m.user_id === currentUser.id ? 'User' : 'Contact',
              text: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            // Filter existing local messages to find ones that aren't in the DB yet
            const optimisticOnly = (chat.messages || []).filter((local: any) => 
               !dbMessages.some(db => db.text === local.text && db.sender === local.sender)
            );

            return {
              ...chat,
              messages: [...dbMessages, ...optimisticOnly]
            };
          }
          return chat;
        }));
      }
    };
    fetchMsgs();
  }, [activeId, currentUser]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeId || !currentUser) return;
    
    // OPTIMISTIC UPDATE: Add message to UI immediately
    const formatted = {
      sender: 'User',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatData(prev => prev.map(chat => 
      chat.id === activeId ? {
        ...chat,
        messages: [...chat.messages, formatted],
        lastMsg: formatted.text,
        time: 'Just now'
      } : chat
    ));

    const { data: inserted } = await supabase.from('messages').insert([{ 
      channel_id: activeId, 
      user_id: currentUser.id, 
      content: text.trim() 
    }]).select().single();

    if (inserted) {
      setChatData(prev => prev.map(chat => 
        chat.id === activeId ? {
          ...chat,
          messages: chat.messages.map((m: any) => 
            (m.text === text.trim() && !m.id) ? { ...m, id: inserted.id } : m
          )
        } : chat
      ));
    }
  };

  const pushChannel = (c: any) => {
    const newChat = { id: c.id, type: c.type, name: c.name || 'Secure Channel', created_by: c.created_by, status: 'Encrypted Link Active', lastMsg: 'Channel Initialized', time: 'Just now', messages: [] };
    setChatData(prev => [newChat, ...prev]);
    setActiveId(c.id);
  };

  const deleteMessage = async (messageId: string, channelId: string) => {
    if (!currentUser) return;
    
    // OPTIMISTIC UPDATE
    setChatData(prev => prev.map(chat => 
      chat.id === channelId ? {
        ...chat,
        messages: chat.messages.filter((m: any) => m.id !== messageId)
      } : chat
    ));

    // DB DELETION
    await supabase.from('messages').delete().eq('id', messageId).eq('user_id', currentUser.id);
  };

  // 5. Fetch Contacts
  useEffect(() => {
    if (!currentUser) return;
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('*, profiles:contact_id(*)')
        .eq('user_id', currentUser.id);
      if (data) setContacts(data.map(d => d.profiles));
    };
    fetchContacts();
  }, [currentUser]);

  const addContact = async (profileId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('contacts').insert([{ user_id: currentUser.id, contact_id: profileId }]);
    if (!error) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      if (profile) setContacts(prev => [...prev, profile]);
    }
  };

  const removeContact = async (profileId: string) => {
    if (!currentUser) return;
    await supabase.from('contacts').delete().eq('user_id', currentUser.id).eq('contact_id', profileId);
    setContacts(prev => prev.filter(c => c.id !== profileId));
  };

  const searchProfiles = async (username: string) => {
    const { data } = await supabase.from('profiles').select('*').ilike('username', `%${username}%`).limit(5);
    return data || [];
  };

  const startDM = async (otherUserId: string) => {
    if (!currentUser) return null;
    
    // Check if DM exists
    const { data: existing } = await supabase.rpc('get_dm_channel', { user_a: currentUser.id, user_b: otherUserId });
    
    if (existing && existing.length > 0) {
      setActiveId(existing[0].id);
      return existing[0].id;
    }

    // Create new DM
    const { data: channel } = await supabase.from('channels').insert([{ type: 'dm' }]).select().single();
    if (channel) {
      await supabase.from('channel_members').insert([
        { channel_id: channel.id, user_id: currentUser.id },
        { channel_id: channel.id, user_id: otherUserId }
      ]);
      pushChannel(channel);
      return channel.id;
    }
    return null;
  };

  return { activeId, setActiveId, chatData, contacts, addContact, removeContact, searchProfiles, startDM, sendMessage, deleteMessage, currentUser, pushChannel };
}
