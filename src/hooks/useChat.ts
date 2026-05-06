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

  // 2. Fetch ONLY channels the current user belongs to
  useEffect(() => {
    if (!currentUser) return;

    const fetchChannels = async () => {
      // Step 1: Get channel IDs where I am a member
      const { data: myMemberships } = await supabase
        .from('channel_members')
        .select('channel_id')
        .eq('user_id', currentUser.id);

      if (!myMemberships || myMemberships.length === 0) return;
      const myChannelIds = myMemberships.map(m => m.channel_id);

      // Step 2: Fetch those channels with ALL members' profiles
      const { data: channels } = await supabase
        .from('channels')
        .select('*, channel_members(user_id, profiles(username, avatar_url, full_name, status))')
        .in('id', myChannelIds)
        .order('created_at', { ascending: false });

      if (!channels) return;

      const formatted = channels.map((c: any) => {
        let name = c.name;
        let avatar = null;
        let otherMemberId = null;
        let status = c.type === 'dm' ? 'Offline' : 'Active';

        if (c.type === 'dm') {
          // Find the OTHER member directly from the already-fetched data
          const otherMember = c.channel_members?.find((m: any) => m.user_id !== currentUser.id);
          if (otherMember) {
            otherMemberId = otherMember.user_id;
            const prof = otherMember?.profiles;
            name = prof?.username || prof?.full_name || 'Unknown';
            avatar = prof?.avatar_url;
            status = prof?.status === 'online' ? 'Online' : 'Offline';
          }
        }

        return {
          id: c.id,
          type: c.type,
          name: name || (c.type === 'dm' ? 'Direct Message' : 'Group'),
          avatar,
          otherMemberId,
          created_by: c.created_by,
          status: status,
          lastMsg: '',
          time: '',
          messages: []
        };
      });

      // Deduplicate DMs with the same person
      const deduplicated: any[] = [];
      const seenDmPartners = new Set();
      for (const chat of formatted) {
        if (chat.type === 'dm') {
          if (seenDmPartners.has(chat.otherMemberId)) continue;
          seenDmPartners.add(chat.otherMemberId);
        }
        deduplicated.push(chat);
      }

      setChatData(deduplicated);
      if (deduplicated.length > 0 && !activeId) setActiveId(deduplicated[0].id);
    };

    fetchChannels();

    // Subscribe to new channel memberships for THIS user only
    const membershipSub = supabase.channel('membership_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'channel_members',
        filter: `user_id=eq.${currentUser.id}`
      }, () => {
        fetchChannels();
      })
      .subscribe();

    // Subscribe to channel deletions
    const channelSub = supabase.channel('channels_realtime')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'channels' }, (payload) => {
        setChatData(prev => prev.filter(ch => ch.id !== payload.old.id));
        if (activeId === payload.old.id) setActiveId(null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(membershipSub);
      supabase.removeChannel(channelSub);
    };
  }, [currentUser]);

  // 3. Real-time Messages — only update chats the user can see
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
          // Only add message if it belongs to a channel in OUR list
          if (chat.id !== newMsg.channel_id) return chat;

          const formatted = {
            id: newMsg.id,
            user_id: newMsg.user_id,
            sender: newMsg.user_id === currentUser.id ? 'User' : 'Contact',
            text: newMsg.content,
            time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          // Duplicate check by ID
          if (chat.messages.some((m: any) => m.id === newMsg.id)) return chat;
          // Duplicate check by content (for optimistic updates without ID)
          if (chat.messages.some((m: any) => !m.id && m.text === formatted.text && m.sender === formatted.sender)) {
            return {
              ...chat,
              messages: chat.messages.map((m: any) =>
                (!m.id && m.text === formatted.text && m.sender === formatted.sender)
                  ? { ...m, id: newMsg.id }
                  : m
              ),
              lastMsg: formatted.text.length > 30 ? formatted.text.substring(0, 30) + '...' : formatted.text,
              time: 'Just now'
            };
          }

          return {
            ...chat,
            messages: [...chat.messages, formatted],
            lastMsg: formatted.text.length > 30 ? formatted.text.substring(0, 30) + '...' : formatted.text,
            time: 'Just now'
          };
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
          if (chat.id !== activeId) return chat;
          return {
            ...chat,
            messages: messages.map(m => ({
              id: m.id,
              user_id: m.user_id,
              sender: m.user_id === currentUser.id ? 'User' : 'Contact',
              text: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          };
        }));
      }
    };
    fetchMsgs();
  }, [activeId, currentUser]);

  // 5. Send Message
  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeId || !currentUser) return;

    // Optimistic update
    const optimistic = {
      user_id: currentUser.id,
      sender: 'User',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatData(prev => prev.map(chat =>
      chat.id === activeId ? {
        ...chat,
        messages: [...chat.messages, optimistic],
        lastMsg: text.trim(),
        time: 'Just now'
      } : chat
    ));

    await supabase.from('messages').insert([{
      channel_id: activeId,
      user_id: currentUser.id,
      content: text.trim()
    }]);
  };

  // 6. Push Channel (for group creation)
  const pushChannel = (c: any) => {
    setChatData(prev => {
      if (prev.some(ch => ch.id === c.id)) return prev;
      return [{ id: c.id, type: c.type, name: c.name || 'Group', created_by: c.created_by, status: 'Active', lastMsg: '', time: 'Just now', messages: [] }, ...prev];
    });
    setActiveId(c.id);
  };

  // 7. Delete Message
  const deleteMessage = async (messageId: string, channelId: string) => {
    if (!currentUser) return;
    setChatData(prev => prev.map(chat =>
      chat.id === channelId ? { ...chat, messages: chat.messages.filter((m: any) => m.id !== messageId) } : chat
    ));
    await supabase.from('messages').delete().eq('id', messageId).eq('user_id', currentUser.id);
  };

  // 8. Contacts
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

    const contactSub = supabase.channel('contacts_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts', filter: `user_id=eq.${currentUser.id}` }, () => fetchContacts())
      .subscribe();

    return () => { supabase.removeChannel(contactSub); };
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

  // 9. Start DM — check locally first, then DB
  const startDM = async (otherUserId: string, otherUsername?: string) => {
    if (!currentUser) return null;

    // Check local state first
    const existing = chatData.find(c => c.type === 'dm' && c.otherMemberId === otherUserId);
    if (existing) {
      setActiveId(existing.id);
      return existing.id;
    }

    // Also check the DB via RPC as a fallback
    const { data: dbExisting } = await supabase.rpc('get_dm_channel', { user_a: currentUser.id, user_b: otherUserId });
    if (dbExisting && dbExisting.length > 0) {
      setActiveId(dbExisting[0].id);
      return dbExisting[0].id;
    }

    // Create new DM
    const { data: channel } = await supabase.from('channels').insert([{ type: 'dm' }]).select().single();
    if (!channel) return null;

    await supabase.from('channel_members').insert([
      { channel_id: channel.id, user_id: currentUser.id },
      { channel_id: channel.id, user_id: otherUserId }
    ]);

    const newChat = {
      id: channel.id,
      type: 'dm',
      name: otherUsername || 'Direct Message',
      avatar: null,
      otherMemberId: otherUserId,
      created_by: currentUser.id,
      status: 'Offline', // Will update on next sync
      lastMsg: '',
      time: 'Just now',
      messages: []
    };

    setChatData(prev => {
      if (prev.some(c => c.id === channel.id)) return prev;
      return [newChat, ...prev];
    });
    setActiveId(channel.id);
    return channel.id;
  };

  return { activeId, setActiveId, chatData, contacts, addContact, removeContact, searchProfiles, startDM, sendMessage, deleteMessage, currentUser, pushChannel };
}
