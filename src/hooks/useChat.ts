import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useChat() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. Get Authentication
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  // 2. Fetch Channels & Subscribe to new ones
  useEffect(() => {
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
  }, [currentUser, activeId]);

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
            
            // Prevent duplicates
            if (chat.messages.some((m: any) => m.text === formatted.text && m.time === formatted.time)) return chat;

            return {
              ...chat,
              messages: [...chat.messages, formatted],
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
        setChatData(prev => prev.map(chat => 
          chat.id === activeId ? {
            ...chat,
            messages: messages.map(m => ({
              sender: m.user_id === currentUser.id ? 'User' : 'Contact',
              text: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          } : chat
        ));
      }
    };
    fetchMsgs();
  }, [activeId, currentUser]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeId || !currentUser) return;
    
    await supabase.from('messages').insert([{ 
      channel_id: activeId, 
      user_id: currentUser.id, 
      content: text.trim() 
    }]);
  };

  const pushChannel = (c: any) => {
    const newChat = { id: c.id, type: c.type, name: c.name || 'Secure Channel', created_by: c.created_by, status: 'Encrypted Link Active', lastMsg: 'Channel Initialized', time: 'Just now', messages: [] };
    setChatData(prev => [newChat, ...prev]);
    setActiveId(c.id);
  };

  return { activeId, setActiveId, chatData, sendMessage, currentUser, pushChannel };
}
