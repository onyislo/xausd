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

  // 2. Fetch Channels (Real Database only)
  useEffect(() => {
    const fetchChannels = async () => {
      const { data: channels, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (channels && !error) {
        const mapped = channels.map(c => ({
          id: c.id,
          type: c.type,
          name: c.name || (c.type === 'dm' ? 'Direct Message' : 'Secure Channel'),
          status: 'Encrypted Link Active',
          lastMsg: 'Connect to begin sync',
          time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: []
        }));
        
        setChatData(mapped);
        
        // Auto-select the first channel if none is active
        if (mapped.length > 0 && !activeId) {
          setActiveId(mapped[0].id);
        }
      }
    };
    fetchChannels();
  }, [currentUser]);

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

  return { activeId, setActiveId, chatData, sendMessage, currentUser };
}
