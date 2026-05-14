import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import localforage from 'localforage';

// Configure localForage
localforage.config({ name: 'XAUSDChat', storeName: 'chat_data' });

const formatMsgTime = (d: Date) => {
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};
const fmtPreview = (c: string) => c.startsWith('[VOICE_NOTE]') ? '🎤 Voice Recording' : c.length > 30 ? c.substring(0, 30) + '...' : c;

export function useChat() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [typingStatus, setTypingStatus] = useState<Record<string, any[]>>({}); // channelId -> list of typing users
  const [presenceChannel, setPresenceChannel] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  // 1. Get Authentication
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  // 1.1 Local-First Architecture: Load cached chat data instantly
  useEffect(() => {
    if (currentUser?.id) {
      localforage.getItem(`chatData_${currentUser.id}`).then((cached) => {
        if (cached) {
          setChatData(prev => {
            // Only set if we haven't already loaded server data
            if (prev.length === 0) return cached as any[];
            return prev;
          });
        }
      }).catch(err => console.error("LocalForage Error:", err));
    }
  }, [currentUser?.id]);

  // 1.2 Local-First Architecture: Save chat data to cache whenever it changes
  useEffect(() => {
    if (currentUser?.id && chatData.length > 0) {
      // We debounce or save directly. For safety, direct save is fine since localforage is async
      localforage.setItem(`chatData_${currentUser.id}`, chatData).catch(err => console.error("Save Cache Error", err));
    }
  }, [chatData, currentUser?.id]);

  // 1.5 Update last_seen instantly on activity
  useEffect(() => {
    if (!currentUser?.id) return;
    let lastUpdate = 0;
    const updateLastSeen = () => {
      const now = Date.now();
      if (now - lastUpdate < 1000) return;
      lastUpdate = now;

      supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', currentUser.id)
        .then();
    };

    // Trigger immediately on load
    updateLastSeen();

    // Update instantly on user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, updateLastSeen));

    // INSTANT OFFLINE: When the user closes the tab, set them offline immediately
    const handleExit = () => {
      // We use a past date to ensure the 30s window thinks they are offline instantly
      const offlineDate = new Date(Date.now() - 60000).toISOString();
      const body = JSON.stringify({ last_seen: offlineDate });
      
      // Use fetch with keepalive to ensure it finishes even if tab is closing
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        },
        body,
        keepalive: true
      });
    };

    window.addEventListener('beforeunload', handleExit);

    // BACKGROUND HEARTBEAT: Update every 10 seconds even if not moving mouse
    const interval = setInterval(updateLastSeen, 10000);

    return () => {
      events.forEach(e => window.removeEventListener(e, updateLastSeen));
      window.removeEventListener('beforeunload', handleExit);
      clearInterval(interval);
    };
  }, [currentUser?.id]);

  // 2. Fetch ONLY channels the current user belongs to
  useEffect(() => {
    if (!currentUser) return;

    const fetchChannels = async () => {
      // Step 1: Get channel IDs where I am a member
      const { data: myMemberships } = await supabase
        .from('channel_members')
        .select('channel_id, last_read_at')
        .eq('user_id', currentUser.id);

      if (!myMemberships || myMemberships.length === 0) return;
      const myChannelIds = myMemberships.map(m => m.channel_id);
      const readAtMap: Record<string, string> = {};
      for (const m of myMemberships) readAtMap[m.channel_id] = m.last_read_at;

      // Step 2: Fetch those channels with ALL members' profiles
      const { data: channels } = await supabase
        .from('channels')
        .select('*, channel_members(user_id, profiles(username, avatar_url, full_name, status, last_seen))')
        .in('id', myChannelIds)
        .order('created_at', { ascending: false });

      if (!channels) return;

      const { data: latestMsgs } = await supabase
        .from('messages')
        .select('channel_id, content, created_at, user_id')
        .in('channel_id', myChannelIds)
        .order('created_at', { ascending: false });
      const latestByChannel: Record<string, any> = {};
      if (latestMsgs) for (const m of latestMsgs) if (!latestByChannel[m.channel_id]) latestByChannel[m.channel_id] = m;

      // Count unread messages per channel (messages from others after my last_read_at)
      const unreadCounts: Record<string, number> = {};
      if (latestMsgs) for (const m of latestMsgs) {
        if (m.user_id === currentUser.id) continue;
        const readAt = readAtMap[m.channel_id];
        if (!readAt || m.created_at > readAt) unreadCounts[m.channel_id] = (unreadCounts[m.channel_id] || 0) + 1;
      }

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const formatted = channels.map((c: any) => {
        let name = 'Unknown';
        let avatar = null;
        let otherMemberId = null;
        let status = c.type === 'dm' ? 'Offline' : 'Active';
        let last_seen = null;

        if (c.type === 'dm') {
          // Find the OTHER member directly from the already-fetched data
          const otherMember = c.channel_members?.find((m: any) => m.user_id !== currentUser.id);
          if (otherMember) {
            otherMemberId = otherMember.user_id;
            const prof = otherMember?.profiles;
            name = prof?.username || prof?.full_name || 'Unknown';
            avatar = prof?.avatar_url;
            last_seen = prof?.last_seen || null;
            const lastSeenDate = prof?.last_seen ? new Date(prof.last_seen) : null;
            const diffTime = lastSeenDate ? Math.abs(now.getTime() - lastSeenDate.getTime()) : Infinity;
            const isOnline = diffTime < 30 * 1000; // 30s for rock-solid stability

            if (isOnline) {
              status = 'Online';
            } else if (lastSeenDate) {
              const timeStr = lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              if (lastSeenDate.toDateString() === now.toDateString()) {
                status = `last seen today at ${timeStr}`;
              } else if (lastSeenDate.toDateString() === yesterday.toDateString()) {
                status = `last seen yesterday at ${timeStr}`;
              } else {
                status = `last seen ${lastSeenDate.toLocaleDateString([], { day: 'numeric', month: 'short' })}`;
              }
            } else {
              status = 'Offline';
            }
          }
        } else {
          name = c.name;
          status = `${c.channel_members?.length || 0} members`;
        }

        return {
          id: c.id,
          type: c.type,
          name: name,
          avatar,
          otherMemberId,
          created_by: c.created_by,
          status: status,
          last_seen: last_seen,
          lastMsg: latestByChannel[c.id] ? fmtPreview(latestByChannel[c.id].content) : '',
          time: latestByChannel[c.id] ? formatMsgTime(new Date(latestByChannel[c.id].created_at)) : '',
          lastActivity: latestByChannel[c.id] ? new Date(latestByChannel[c.id].created_at).getTime() : 0,
          messages: [],
          unreadCount: unreadCounts[c.id] || 0,
          invite_token: c.invite_token
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
      deduplicated.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));

      setChatData(prev => {
        // Merge the new channel list with existing cached messages so we don't wipe out local cache
        return deduplicated.map(newChat => {
          const existing = prev.find(p => p.id === newChat.id);
          if (existing && existing.messages && existing.messages.length > 0) {
            return { ...newChat, messages: existing.messages };
          }
          return newChat;
        });
      });
    };

    fetchChannels();

    // Subscribe to new channel memberships for ALL users (updates member counts)
    const membershipSub = supabase.channel('membership_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'channel_members'
      }, () => {
        fetchChannels();
      })
      .subscribe();

    // Subscribe to ALL profile updates to catch last_seen changes in real time
    const profilesSub = supabase.channel('profiles_realtime_status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        const updatedProfile = payload.new as any;
        
        setChatData(prev => {
          let changed = false;
          const next = prev.map(chat => {
            if (chat.type === 'dm' && chat.otherMemberId === updatedProfile.id) {
              changed = true;
              return { ...chat, last_seen: updatedProfile.last_seen };
            }
            return chat;
          });
          return changed ? next : prev;
        });

        setContacts(prev => {
          let changed = false;
          const next = prev.map(contact => {
            if (contact.id === updatedProfile.id) {
              changed = true;
              return { ...contact, ...updatedProfile };
            }
            return contact;
          });
          return changed ? next : prev;
        });
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
      supabase.removeChannel(profilesSub);
      supabase.removeChannel(channelSub);
    };
  }, [currentUser]);

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // 2.7 REAL-TIME TYPING & PRESENCE (Instant Status)
  useEffect(() => {
    if (!currentUser) return;

    // Use a single channel for both typing and presence
    const channel = supabase.channel('chat_presence', {
      config: { presence: { key: currentUser.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: Record<string, any[]> = {};
        const online = new Set<string>();

        Object.keys(state).forEach((key) => online.add(key));

        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.is_typing && p.channel_id) {
              if (!typing[p.channel_id]) typing[p.channel_id] = [];
              if (p.user_id !== currentUser.id) {
                typing[p.channel_id].push({ id: p.user_id, username: p.username || 'Someone', avatarUrl: p.avatarUrl });
              }
            }
          });
        });
        setTypingStatus(typing);
        setOnlineUsers(online);

        // Instant update for chatData statuses
        setChatData(prev => prev.map(chat => {
          if (chat.type === 'dm' && chat.otherMemberId) {
            const isOnline = online.has(chat.otherMemberId);
            if (isOnline && chat.status !== 'Online') {
              return { ...chat, status: 'Online' };
            }
          }
          return chat;
        }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0],
            avatarUrl: currentUser.user_metadata?.avatar_url,
            is_typing: false,
            channel_id: null
          });
        }
      });

    setPresenceChannel(channel);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // 2.5 Periodic Status Auto-Refresher (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      setChatData(prev => {
        let changed = false;
        const next = prev.map(chat => {
          if (chat.type === 'dm' && chat.otherMemberId) {
            const isOnline = onlineUsers.has(chat.otherMemberId);
            const now = new Date();
            const lastSeenDate = chat.last_seen ? new Date(chat.last_seen) : null;
            
            let newStatus = 'Offline';
            if (isOnline) {
              newStatus = 'Online';
            } else if (lastSeenDate) {
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              const timeStr = lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              if (lastSeenDate.toDateString() === now.toDateString()) {
                newStatus = `last seen today at ${timeStr}`;
              } else if (lastSeenDate.toDateString() === yesterday.toDateString()) {
                newStatus = `last seen yesterday at ${timeStr}`;
              } else {
                newStatus = `last seen ${lastSeenDate.toLocaleDateString([], { day: 'numeric', month: 'short' })}`;
              }
            }
            if (chat.status !== newStatus) {
              changed = true;
              return { ...chat, status: newStatus };
            }
          }
          return chat;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Real-time Messages — only update chats the user can see
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel('realtime_comms')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMsg = payload.new as any;
        const isMe = newMsg.user_id === currentUser.id;

        const formatted = {
          id: newMsg.id,
          user_id: newMsg.user_id,
          sender: isMe ? 'User' : 'Contact',
          text: newMsg.content,
          time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created_at: newMsg.created_at
        };

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // ─── LOCAL NOTIFICATION ───
        if (!isMe && document.visibilityState === 'hidden') {
          const { data: profile } = await supabase.from('profiles').select('username').eq('id', newMsg.user_id).single();
          new Notification(profile?.username || 'New Message', {
            body: formatted.text.startsWith('[VOICE_NOTE]') ? '🎤 Voice Recording' : formatted.text,
            icon: '/logo.svg'
          });
        }

        setChatData(prev => prev.map(chat => {
          if (chat.id !== newMsg.channel_id) return chat;

          // Check if this message was already added optimistically (no ID yet)
          const isOptimistic = chat.messages.some((m: any) => !m.id && m.text === formatted.text && m.user_id === formatted.user_id);

          const updatedMessages = isOptimistic && isMe
            ? chat.messages.map((m: any) => (!m.id && m.text === formatted.text) ? { ...m, id: newMsg.id } : m)
            : [...chat.messages, formatted]; // Newest at the bottom

          return {
            ...chat,
            messages: updatedMessages,
            lastMsg: formatted.text.startsWith('[VOICE_NOTE]')
              ? "🎤 Voice Recording"
              : (formatted.text.length > 30 ? formatted.text.substring(0, 30) + '...' : formatted.text),
            time: timeStr,
            unreadCount: (activeId === chat.id || isMe) ? (chat.unreadCount || 0) : (chat.unreadCount || 0) + 1,
            lastActivity: now.getTime()
          };
        }).sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, activeId]);

  // 4. Fetch Messages for Active Channel
  useEffect(() => {
    if (!activeId || !currentUser) return;

    const fetchMsgs = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*, replied_message:reply_to_id(content, user_id)')
        .eq('channel_id', activeId)
        .order('created_at', { ascending: true }); // Standard order

      if (messages && !error) {
        const last = messages[messages.length - 1];
        // Mark channel as read
        supabase.from('channel_members').update({ last_read_at: new Date().toISOString() }).eq('channel_id', activeId).eq('user_id', currentUser.id).then();
        setChatData(prev => prev.map(chat => {
          if (chat.id !== activeId) return chat;
          return {
            ...chat,
            unreadCount: 0,
            messages: messages.map(m => ({
              id: m.id,
              user_id: m.user_id,
              sender: m.user_id === currentUser.id ? 'User' : 'Contact',
              text: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              created_at: m.created_at,
              reply_to: m.replied_message
            })),
            lastMsg: last ? fmtPreview(last.content) : chat.lastMsg,
            time: last ? formatMsgTime(new Date(last.created_at)) : chat.time
          };
        }));
      }
    };
    fetchMsgs();
  }, [activeId, currentUser]);

  // 5. Send Message
  const sendMessage = async (text: string, replyToId?: string | null) => {
    if (!text.trim() || !activeId || !currentUser) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Optimistic update
    const optimistic = {
      user_id: currentUser.id,
      sender: 'User',
      text: text.trim(),
      time: timeStr,
      created_at: now.toISOString(),
      reply_to: replyingTo ? { content: replyingTo.text, user_id: replyingTo.user_id } : null
    };

    setChatData(prev => prev.map(chat =>
      chat.id === activeId ? {
        ...chat,
        messages: [...chat.messages, optimistic], // Newest at the bottom
        lastMsg: text.trim().startsWith('[VOICE_NOTE]') ? "🎤 Voice Recording" : text.trim(),
        time: timeStr,
        lastActivity: now.getTime()
      } : chat
    ).sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)));

    setReplyingTo(null);

    await supabase.from('messages').insert([{
      channel_id: activeId,
      user_id: currentUser.id,
      content: text.trim(),
      reply_to_id: replyToId
    }]);

    // Send push notification
    fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: activeId,
        content: text.trim(),
        sender_id: currentUser.id
      })
    }).catch(err => console.error('Push Error:', err));
  };

  const sendVoiceNote = async (blob: Blob) => {
    if (!activeId || !currentUser) return;
    
    // Optimistic update for voice note
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimistic = {
      user_id: currentUser.id,
      sender: 'User',
      text: '[VOICE_NOTE]loading...',
      time: timeStr,
      created_at: now.toISOString()
    };

    setChatData(prev => prev.map(chat =>
      chat.id === activeId ? {
        ...chat,
        messages: [...chat.messages, optimistic],
        lastMsg: "🎤 Voice Recording",
        time: timeStr,
        lastActivity: now.getTime()
      } : chat
    ).sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)));

    const fileName = `${activeId}/${Date.now()}.webm`;
    const { data, error } = await supabase.storage.from('comms').upload(fileName, blob);
    if (error) return;

    const { data: { publicUrl } } = supabase.storage.from('comms').getPublicUrl(fileName);
    const content = `[VOICE_NOTE]${publicUrl}`;

    setChatData(prev => prev.map(chat => 
      chat.id === activeId ? {
        ...chat,
        messages: chat.messages.map((m: any) => m.text === '[VOICE_NOTE]loading...' ? { ...m, text: content } : m)
      } : chat
    ));

    await supabase.from('messages').insert([{
      channel_id: activeId,
      user_id: currentUser.id,
      content
    }]);

    // Send push notification
    fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: activeId,
        content,
        sender_id: currentUser.id
      })
    }).catch(err => console.error('Push Error:', err));
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
      if (data) {
        const uniqueContacts = Array.from(new Map(data.map((d: any) => [d.profiles?.id, d.profiles])).values()).filter(Boolean);
        setContacts(uniqueContacts);
      }
    };

    fetchContacts();

    const contactSub = supabase.channel('contacts_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts', filter: `user_id=eq.${currentUser.id}` }, () => fetchContacts())
      .subscribe();

    return () => { supabase.removeChannel(contactSub); };
  }, [currentUser]);

  const addContact = async (profileId: string) => {
    if (!currentUser) return;
    
    // Check if already a friend
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('contact_id', profileId);

    if (existing && existing.length > 0) return;

    const { error } = await supabase.from('contacts').insert([{ user_id: currentUser.id, contact_id: profileId }]);
    if (!error) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      if (profile) {
        setContacts(prev => {
          if (prev.some(p => p.id === profile.id)) return prev;
          return [...prev, profile];
        });
      }
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

  // 10. Typing Indicator Control
  const setTyping = async (channelId: string | null, isTyping: boolean) => {
    if (!presenceChannel || !currentUser) return;
    await presenceChannel.track({
      user_id: currentUser.id,
      username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0],
      avatarUrl: currentUser.user_metadata?.avatar_url,
      is_typing: isTyping,
      channel_id: channelId
    });
  };

  return { activeId, setActiveId, chatData, contacts, addContact, removeContact, searchProfiles, startDM, sendMessage, sendVoiceNote, deleteMessage, currentUser, pushChannel, typingStatus, setTyping, onlineUsers, replyingTo, setReplyingTo };
}
