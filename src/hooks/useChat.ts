import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const INITIAL_CHAT_DATA = [
  {
    id: 'ai',
    type: 'ai',
    name: 'AuScope AI Sentinel',
    status: 'Online • Real-time Data',
    lastMsg: 'Fed swaps currently indicate a 65% probability of a rate cut.',
    time: 'Just now',
    messages: [
      { sender: 'AI', text: 'Terminal initialized. How can I assist your trading today?', time: '09:00 AM' },
      { sender: 'User', text: 'Give me the latest read on XAU order flow.', time: '09:05 AM' },
      { sender: 'AI', text: 'Currently detecting 64% buyer dominance in the dark pools with a massive 12,500 oz block buy at 2,325.00.', time: '09:05 AM' }
    ]
  }
];

export function useChat() {
  const [activeId, setActiveId] = useState('ai');
  const [chatData, setChatData] = useState<any[]>(INITIAL_CHAT_DATA);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Auth User
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  // Fetch Channels
  useEffect(() => {
    const fetchChannels = async () => {
      const { data: channels } = await supabase.from('channels').select('*');
      if (channels) {
        const mapped = channels.map(c => ({
          id: c.id,
          type: c.type,
          name: c.name || 'Secure Chat',
          status: 'Encrypted Link Active',
          lastMsg: 'Ready for Comms',
          time: 'Active',
          messages: []
        }));
        setChatData(prev => [...INITIAL_CHAT_DATA, ...mapped]);
      }
    };
    fetchChannels();
  }, []);

  // Real-time Sub
  useEffect(() => {
    const channel = supabase.channel('realtime_comms')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as any;
        setChatData(prev => prev.map(chat => {
          if (chat.id === newMsg.channel_id) {
            const formatted = {
              sender: newMsg.user_id === currentUser?.id ? 'User' : 'Contact',
              text: newMsg.content,
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            if (chat.messages.some((m: any) => m.text === formatted.text && m.time === formatted.time)) return chat;
            return {
              ...chat,
              messages: [...chat.messages, formatted],
              lastMsg: formatted.text.substring(0, 30),
              time: 'Just now'
            };
          }
          return chat;
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  // Fetch Messages for active
  useEffect(() => {
    if (!activeId || activeId.length < 20) return;
    const fetchMsgs = async () => {
      const { data: messages } = await supabase.from('messages').select('*').eq('channel_id', activeId).order('created_at', { ascending: true });
      if (messages) {
        setChatData(prev => prev.map(chat => chat.id === activeId ? {
          ...chat,
          messages: messages.map(m => ({
            sender: m.user_id === currentUser?.id ? 'User' : 'Contact',
            text: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        } : chat));
      }
    };
    fetchMsgs();
  }, [activeId, currentUser]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (activeId.length > 20 && currentUser) {
      await supabase.from('messages').insert([{ channel_id: activeId, user_id: currentUser.id, content: text.trim() }]);
    } else {
      // Local Echo for AI
      const echo = { sender: 'User', text, time: 'Just now' };
      setChatData(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, echo] } : c));
    }
  };

  return { activeId, setActiveId, chatData, setChatData, sendMessage, currentUser };
}
