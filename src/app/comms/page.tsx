h'use client';

import React, { useState, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderPrice from '@/components/HeaderPrice';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/lib/supabase';
import { Search, Send, Users, User, Phone, MoreVertical, Plus, Shield, Trash2, UserPlus, UserMinus, Copy, Check, Link as LinkIcon, X, Info, BellOff, LogOut, CheckCircle, Hash, MessageSquare, Bot, PhoneMissed, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import PhoneCall from '@/components/PhoneCall';

function CommsContent() {
  const { activeId, setActiveId, chatData, contacts: friends, addContact: addFriend, removeContact: removeFriend, searchProfiles, startDM, sendMessage, deleteMessage, currentUser, pushChannel } = useChat();
  const [activeCall, setActiveCall] = useState<{ roomId: string, isIncoming: boolean, targetId: string, targetName: string } | null>(null);
  const [incomingRing, setIncomingRing] = useState<{ roomId: string, callerId: string, callerName: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const inputText = activeId ? drafts[activeId] || '' : '';
  const setInputText = (val: string) => {
    if (activeId) setDrafts(prev => ({ ...prev, [activeId]: val }));
  };
  const [tab, setTab] = useState<'all' | 'channels' | 'dms' | 'friends' | 'ai' | 'calls'>('all');
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const activeChat = chatData.find(c => c.id === activeId) || null;

  // Auto-scroll to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);
  const filtered = tab === 'all'
    ? chatData.filter(c => c.type === 'group' || c.type === 'dm')
    : tab === 'channels'
      ? chatData.filter(c => c.type === 'group')
      : tab === 'dms'
        ? chatData.filter(c => c.type === 'dm')
        : chatData.filter(c => c.type === 'ai');
  const handleAddFriend = async (id: string) => {
    await addFriend(id);
    setToastMessage("Friend added successfully");
    setTimeout(() => setToastMessage(null), 10000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleCreate = async () => {
    if (!newGroupName.trim() || !currentUser) return;
    const { data: channel, error } = await supabase
      .from('channels')
      .insert([{ name: newGroupName.trim(), type: 'group', created_by: currentUser.id }])
      .select().single();
    if (channel) {
      await supabase.from('channel_members').upsert(
        [{ channel_id: channel.id, user_id: currentUser.id }],
        { onConflict: 'channel_id,user_id', ignoreDuplicates: true }
      );
      pushChannel(channel);
      setIsCreating(false);
      setNewGroupName('');
    } else {
      console.error(error);
    }
  };

  // ── ADMIN ACTIONS ──
  React.useEffect(() => {
    if (isManaging && activeChat) {
      fetchMembers();
    }
  }, [isManaging, activeId]);

  // Handle invite links
  React.useEffect(() => {
    const inviteId = searchParams.get('invite');
    if (inviteId && currentUser) {
      joinChannel(inviteId);
    }
  }, [searchParams, currentUser]);

  const fetchMembers = async () => {
    if (!activeId) return;
    const { data } = await supabase
      .from('channel_members')
      .select('*, profiles(username, avatar_url, full_name)')
      .eq('channel_id', activeId);
    if (data) setMembers(data);
  };

  const joinChannel = async (channelId: string) => {
    const { error } = await supabase
      .from('channel_members')
      .upsert([{ channel_id: channelId, user_id: currentUser.id }], { onConflict: 'channel_id,user_id', ignoreDuplicates: true });
    if (!error) {
      window.history.replaceState({}, '', '/comms');
      // Refresh channels
      window.location.reload();
    }
  };

  const handleAddMember = async () => {
    if (!inviteEmail.trim() || !activeId) return;
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', inviteEmail.trim())
      .single();

    if (user) {
      await supabase.from('channel_members').insert([{ channel_id: activeId, user_id: user.id }]);
      setInviteEmail('');
      fetchMembers();
    } else {
      alert("Operative not found in database.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeId) return;
    await supabase.from('channel_members').delete().eq('channel_id', activeId).eq('user_id', userId);
    fetchMembers();
  };

  const handleDeleteChannel = async () => {
    if (!activeId || !confirm("CRITICAL: This will terminate the channel and all encrypted logs. Continue?")) return;
    await supabase.from('channels').delete().eq('id', activeId);
    setIsManaging(false);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/comms?invite=${activeId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onRightClick = (e: React.MouseEvent, msgId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, msgId });
  };

  React.useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleSearch = async (val: string) => {
    if (val.length < 2) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const results = await searchProfiles(val);
    setSearchResults(results);
  };

  const onStartDM = async (uid: string, username?: string) => {
    await startDM(uid, username);
    setTab('dms');
    setSearchResults([]);
  };

  React.useEffect(() => {
    if (!currentUser) return;
    supabase.from('call_logs')
      .select('*, caller:profiles!caller_id(username), callee:profiles!callee_id(username)')
      .or(`caller_id.eq.${currentUser.id},callee_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setCallHistory(data); });
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) return;
    const ringChannel = supabase.channel(`calls:${currentUser.id}`)
      .on('broadcast', { event: 'ring' }, ({ payload }) => setIncomingRing({ roomId: payload.roomId, callerId: payload.callerId, callerName: payload.callerName }))
      .on('broadcast', { event: 'cancel_ring' }, () => setIncomingRing(null))
      .subscribe();
    return () => { supabase.removeChannel(ringChannel); };
  }, [currentUser]);

  const startCall = () => {
    if (!activeChat || activeChat.type !== 'dm') return;
    const roomId = activeChat.id;
    const targetId = activeChat.otherMemberId;
    const targetName = activeChat.name;
    const callerId = currentUser?.id;
    const callerName = currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'Caller';

    // Show caller's card immediately
    setActiveCall({ roomId, isIncoming: false, targetId, targetName });

    // Subscribe then send so the broadcast actually fires
    const ringCh = supabase.channel(`calls:${targetId}`);
    ringCh.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        ringCh.send({ type: 'broadcast', event: 'ring', payload: { roomId, callerId, callerName } });
      }
    });
  }; s

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 p-2 gap-2 overflow-hidden md:p-4 md:gap-4">

        {/* HEADER */}
        <header className={`
          shrink-0 h-[60px] bg-[#0f1420] border border-yellow-500/10 
          flex justify-between items-center pl-16 pr-3 md:pl-6 md:pr-6 
          rounded-xl shadow-lg relative
          ${activeChat ? 'hidden md:flex' : 'flex'}
        `}>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
          <h1 className="text-[13px] md:text-[16px] font-black tracking-widest text-yellow-500 uppercase">AuScope | Comms</h1>
          <div className="flex items-center gap-2 md:gap-3"><HeaderPrice /></div>
        </header>

        <div className="flex-1 flex gap-0 md:gap-4 min-h-0">

          {/* LEFT PANEL */}
          <section className={`
            flex flex-col shrink-0 overflow-hidden bg-[#0f1420] border-0 
            md:border-yellow-500/20 w-full md:w-[290px] rounded-none md:rounded-xl
            ${activeChat ? 'hidden md:flex' : 'flex'}
          `}>

            {/* Tabs — premium icons (desktop: top; mobile: bottom via order) */}
            <div className="flex border-b-0 border-t border-yellow-500/10 shrink-0 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-slate-900/50 order-2 md:order-0 md:border-b md:border-t-0 md:p-1">
              {([
                { key: 'all', icon: <Hash size={16} />, title: 'All Messages' },
                { key: 'channels', icon: <Shield size={16} />, title: 'Groups' },
                { key: 'dms', icon: <MessageSquare size={16} />, title: 'Direct' },
                { key: 'friends', icon: <Users size={16} />, title: 'Friends' },
                { key: 'calls', icon: <Phone size={16} />, title: 'Calls' },
                { key: 'ai', icon: <Bot size={16} />, title: 'AI Chat' },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  title={t.title}
                  className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all duration-300 ${tab === t.key
                    ? 'text-yellow-500 bg-yellow-500/10 shadow-[inset_0_0_10px_rgba(245,196,81,0.1)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                >
                  <div className={`transition-transform duration-300 ${tab === t.key ? 'scale-110' : 'scale-100'}`}>
                    {t.icon}
                  </div>
                </button>
              ))}
            </div>

            {/* Search + Create */}
            <div className="p-3 flex gap-2 border-b border-yellow-500/10 shrink-0 bg-slate-900/20 max-md:order-0">
              <div className="relative flex-1 group">
                <input
                  id="comms-search"
                  className="w-full bg-[#0a0e17]/80 border border-slate-700/50 text-[11px] px-8 py-2 rounded-xl focus:border-yellow-500/40 focus:bg-[#0a0e17] transition-all outline-none placeholder:text-slate-600 text-slate-300 font-medium"
                  placeholder={tab === 'friends' ? "Search by username to add friends..." : "Intercept communications..."}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500/60 transition-colors" />
              </div>
              {(tab === 'channels' || tab === 'all' || tab === 'friends') && (
                <button
                  onClick={() => (tab === 'channels' || tab === 'all') ? setIsCreating(true) : document.getElementById('comms-search')?.focus()}
                  className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl text-[#1a1200] hover:shadow-[0_0_15px_rgba(245,196,81,0.3)] transition-all active:scale-95 group"
                >
                  {(tab === 'channels' || tab === 'all') ? <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> : <UserPlus size={18} />}
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar order-1 md:order-0">
              {isSearching && searchResults.length > 0 && (
                <div className="mb-4">
                  <span className="text-[9px] font-black text-yellow-500/50 px-3 uppercase tracking-widest block mb-2">Network Discovery</span>
                  {searchResults.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-yellow-500/5 border border-transparent hover:border-yellow-500/20 group">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-700 grow-0 shrink-0 text-slate-400">
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${u.status === 'online' ? 'bg-green-500' : 'bg-slate-600'} border-2 border-[#0f1420] rounded-full`} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-300 truncate">{u.username}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!friends.some((f: any) => f.id === u.id) && (
                          <button onClick={() => handleAddFriend(u.id)} className="p-1.5 text-slate-500 hover:text-yellow-500 transition-colors" title="Add Friend"><UserPlus size={14} /></button>
                        )}
                        <button onClick={() => onStartDM(u.id, u.username)} className="p-1.5 text-slate-500 hover:text-green-500 transition-colors" title="Message"><MessageSquare size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <div className="h-[1px] bg-yellow-500/10 my-3 mx-2" />
                </div>
              )}

              {tab === 'calls' ? (
                callHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                    <Phone size={32} className="opacity-20" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">No Call History</span>
                  </div>
                ) : callHistory.map((c: any) => {
                  const isCaller = c.caller_id === currentUser?.id;
                  const name = isCaller ? c.callee?.username : c.caller?.username;
                  const otherUserId = isCaller ? c.callee_id : c.caller_id;
                  const Icon = c.status === 'missed' ? PhoneMissed : isCaller ? PhoneOutgoing : PhoneIncoming;
                  const col = c.status === 'missed' ? 'text-red-400' : 'text-green-400';
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-700/50 group transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400">{name?.[0]?.toUpperCase()}</div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-bold text-slate-200 truncate">{name}</div>
                          <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter ${col}`}>
                            <Icon size={10} />{c.status} {c.duration_sec > 0 ? `· ${c.duration_sec}s` : ''}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => onStartDM(otherUserId, name)} className="p-2 text-slate-500 hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-all" title="Call Back"><Phone size={15} /></button>
                    </div>
                  );
                })
              ) : tab === 'friends' ? (
                friends.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-600 h-full">
                    <Users size={32} className="opacity-20" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">No Friends Found</span>
                  </div>
                ) : (
                  friends.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-700/50 group transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400">{f.username?.[0]?.toUpperCase()}</div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${f.status === 'online' ? 'bg-green-500' : 'bg-slate-600'} border-2 border-[#0f1420] rounded-full shadow-lg`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-bold text-slate-200 truncate">{f.username}</div>
                          <div className={`text-[9px] ${f.status === 'online' ? 'text-green-500/70' : 'text-slate-500'} font-bold uppercase tracking-tighter`}>
                            {f.status === 'online' ? 'Encrypted Connection' : 'Signal Lost'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onStartDM(f.id, f.username)} className="p-2 text-slate-400 hover:text-yellow-500"><MessageSquare size={18} /></button>
                        <button onClick={() => removeFriend(f.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                    <span className="text-2xl">{tab === 'ai' ? '🤖' : tab === 'dms' ? '💬' : '#'}</span>
                    <span className="text-[10px] uppercase tracking-widest text-center px-4">
                      {tab === 'all' ? 'No messages yet.' : tab === 'channels' ? 'No channels yet. Hit + to create one.' : tab === 'dms' ? 'No direct messages yet.' : 'No AI sessions yet.'}
                    </span>
                  </div>
                ) : filtered.map(chat => (
                  <ChatListItem key={chat.id} chat={chat} active={activeId === chat.id} onSelect={() => setActiveId(chat.id)} />
                ))
              )}
            </div>
          </section>

          {/* CHAT PANEL */}
          <section className={`
            flex-1 bg-[#0f1420] border-0 md:border-yellow-500/20 
            rounded-none md:rounded-xl flex flex-col overflow-hidden shadow-2xl
            ${!activeChat ? 'hidden md:flex' : ''}
          `}>
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                <Users size={56} className="opacity-20 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">No Active Comms Detected</span>
                <span className="text-[9px] uppercase tracking-widest opacity-30">Select a channel to begin</span>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="h-[64px] border-b border-yellow-500/10 flex justify-between items-center px-3 md:px-6 shrink-0 bg-slate-800/40">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => setActiveId(null as any)}
                      className="flex md:hidden w-9 h-9 rounded-lg hover:bg-slate-700/50 items-center justify-center text-slate-300 shrink-0"
                      aria-label="Back"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/10 text-yellow-500 overflow-hidden shrink-0">
                      {activeChat.avatar ? (
                        <img src={activeChat.avatar} className="w-full h-full object-cover" alt="" />
                      ) : activeChat.type === 'dm' ? <User size={16} /> : <Users size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[13px] md:text-sm font-bold text-slate-200 truncate">{activeChat.name}</h2>
                      <span className={`text-[9px] md:text-[10px] font-mono tracking-widest ${activeChat.status === 'Online' ? 'text-green-400/80' : 'text-slate-500'}`}>{activeChat.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 shrink-0">
                    <HeaderPrice />

                    <div className="relative">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-1.5 rounded-lg transition-all ${isMenuOpen ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-slate-700/50'}`}
                      >
                        <MoreVertical size={17} />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-[#0f1420] border border-yellow-500/30 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                          {activeChat.type === 'dm' ? (
                            /* ── DM MENU ── */
                            <>
                              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                                <Info size={14} /> View Profile
                              </button>
                              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                                <BellOff size={14} /> Mute Chat
                              </button>
                              <div className="h-[1px] bg-red-500/10 my-1" />
                              <button onClick={() => { handleDeleteChannel(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-all font-bold">
                                <Trash2 size={14} /> Delete Chat
                              </button>
                            </>
                          ) : (
                            /* ── GROUP MENU ── */
                            <>
                              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                                <Info size={14} /> Group Info
                              </button>

                              {(activeChat.created_by === currentUser?.id || !activeChat.created_by) && (
                                <button onClick={() => { setIsManaging(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-yellow-500/80 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all font-bold">
                                  <Shield size={14} /> Manage Group
                                </button>
                              )}

                              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                                <BellOff size={14} /> Mute Group
                              </button>

                              <div className="h-[1px] bg-yellow-500/10 my-1" />

                              <button onClick={() => { copyInviteLink(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                                <LinkIcon size={14} /> Invite Link
                              </button>

                              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                                <LogOut size={14} /> Leave Group
                              </button>

                              {(activeChat.created_by === currentUser?.id || !activeChat.created_by) && (
                                <>
                                  <div className="h-[1px] bg-red-500/10 my-1" />
                                  <button onClick={() => { handleDeleteChannel(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-all font-bold">
                                    <Trash2 size={14} /> Delete Group
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-[#0a0e17] custom-scrollbar">
                  {activeChat.messages?.map((msg: any, i: number) => (
                    <MessageItem
                      key={msg.id || i}
                      msg={msg}
                      currentUserId={currentUser?.id}
                      contactAvatar={activeChat.avatar}
                      contactName={activeChat.name}
                      onDelete={(mid: string) => deleteMessage(mid, activeId as string)}
                      onContextMenu={(e: React.MouseEvent) => msg.id && msg.user_id === currentUser?.id && onRightClick(e, msg.id)}
                    />
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-[#0f1420] border-t border-slate-800">
                  <div className="bg-[#0a0e17] border border-slate-700 rounded-xl flex items-end p-2 focus-within:border-yellow-500/50 transition-all">
                    <textarea
                      rows={1}
                      className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none px-3 resize-none custom-scrollbar py-2 max-h-32"
                      placeholder="Send encrypted message..."
                      value={inputText}
                      onChange={e => {
                        setInputText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                          e.currentTarget.style.height = 'auto';
                        }
                      }}
                    />
                    <button
                      className="w-9 h-9 bg-yellow-500 hover:bg-yellow-400 text-[#1a1200] rounded-lg flex items-center justify-center transition-all active:scale-95"
                      onClick={handleSend}>
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Create Channel Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[360px] bg-[#0f1420] border border-yellow-500/30 rounded-2xl p-6 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent rounded-t-2xl" />
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-3">
                <Users size={28} className="text-yellow-500" />
              </div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-widest">New Channel</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Encrypted Group Protocol</p>
            </div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Channel Name</label>
            <input
              className="w-full bg-[#0a0e17] text-slate-100 text-sm px-4 py-3 rounded-xl border border-slate-700 outline-none focus:border-yellow-500/50 mb-4 font-mono"
              placeholder="e.g. ALPHA_SQUADRON"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setIsCreating(false); setNewGroupName(''); }}
                className="flex-1 py-2.5 bg-slate-800 text-slate-400 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-700 transition-all">
                Abort
              </button>
              <button onClick={handleCreate}
                className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#1a1200] text-[10px] font-black rounded-xl uppercase tracking-widest transition-all active:scale-[0.98]">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Manage Channel Modal */}
      {isManaging && activeChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[450px] bg-[#0f1420] border border-yellow-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest">Manage Hub</h2>
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">{activeChat.name}</p>
              </div>
              <button onClick={() => setIsManaging(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Invite Section */}
              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block ml-1">Add Operative (by username)</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-[#0a0e17] text-slate-100 text-sm px-4 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-yellow-500/50"
                    placeholder="Enter operative username..."
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                  <button onClick={handleAddMember} className="px-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500 hover:bg-yellow-500/20 transition-all">
                    <UserPlus size={18} />
                  </button>
                </div>

                <button onClick={copyInviteLink} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/40 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all group">
                  {copied ? <Check size={14} className="text-green-500" /> : <LinkIcon size={14} className="group-hover:text-yellow-500" />}
                  {copied ? 'LINK COPIED TO CLIPBOARD' : 'GENERATE & COPY INVITE LINK'}
                </button>
              </div>

              {/* Members List */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-3 ml-1">Authorized Personnel ({members.length})</label>
                <div className="bg-[#0a0e17] rounded-xl border border-slate-800 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {members.map((m: any) => (
                    <div key={m.user_id} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {m.profiles?.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-300 font-bold">{m.profiles?.username}</span>
                      </div>
                      {m.user_id !== currentUser?.id && (
                        <button onClick={() => handleRemoveMember(m.user_id)} className="text-slate-600 hover:text-red-500 transition-colors" title="Revoke Access">
                          <UserMinus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-red-500/10">
                <button onClick={handleDeleteChannel} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest transition-all">
                  <Trash2 size={16} />
                  Decommission Hub (Permanent)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          msgId={contextMenu.msgId}
          onDelete={(mid: string) => deleteMessage(mid, activeId as string)}
        />
      )}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[2000] w-72 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="flex items-center gap-3 p-4">
            <CheckCircle size={18} className="text-green-500" />
            <span className="text-[12px] font-bold uppercase tracking-widest">{toastMessage}</span>
          </div>
          <div className="h-1 bg-slate-800 w-full">
            <div className="h-full bg-green-500" style={{ animation: 'toast-progress 10s linear forwards' }} />
          </div>
        </div>
      )}

      {incomingRing && !activeCall && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex flex-col items-center gap-6 bg-[#0f1420] border border-yellow-500/30 rounded-3xl p-10 shadow-[0_0_80px_rgba(0,0,0,0.9)] w-[320px] animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent rounded-t-3xl" />
            {/* Pulsing avatar */}
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping" />
              <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/50 flex items-center justify-center text-3xl font-black text-yellow-400">
                {incomingRing.callerName[0]?.toUpperCase()}
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-white text-lg font-black uppercase tracking-widest">{incomingRing.callerName}</p>
              <div className="flex items-center gap-2">
                <Phone size={11} className="text-yellow-400 animate-pulse" />
                <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest animate-pulse">Incoming Call...</p>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => { setActiveCall({ roomId: incomingRing.roomId, isIncoming: true, targetId: incomingRing.callerId, targetName: incomingRing.callerName }); setIncomingRing(null); }}
                className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-[#1a1200] font-black tracking-widest uppercase text-[10px] rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >Accept</button>
              <button
                onClick={() => { supabase.channel(`calls:${incomingRing.callerId}`).send({ type: 'broadcast', event: 'cancel_ring', payload: {} }); setIncomingRing(null); }}
                className="flex-1 py-3 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-black tracking-widest uppercase text-[10px] rounded-xl transition-all active:scale-95"
              >Decline</button>
            </div>
          </div>
        </div>
      )}

      {activeCall && (
        <PhoneCall
          roomId={activeCall.roomId}
          isIncoming={activeCall.isIncoming}
          targetName={activeCall.targetName}
          targetId={activeCall.targetId}
          currentUserId={currentUser?.id}
          onEndCall={() => {
            setActiveCall(null);
            // Refresh call history after call ends
            if (currentUser) supabase.from('call_logs')
              .select('*, caller:profiles!caller_id(username), callee:profiles!callee_id(username)')
              .or(`caller_id.eq.${currentUser.id},callee_id.eq.${currentUser.id}`)
              .order('created_at', { ascending: false }).limit(20)
              .then(({ data }) => { if (data) setCallHistory(data); });
          }}
        />
      )}
    </main>
  );
}

export default function CommsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0e17] text-yellow-500 font-mono">LOADING ENCRYPTED CHANNEL...</div>}>
      <CommsContent />
    </Suspense>
  );
}


function ContextMenu({ x, y, msgId, onDelete }: any) {
  return (
    <div
      className="fixed z-[1000] bg-[#0f1420] border border-yellow-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-1.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md"
      style={{ top: y, left: x }}
    >
      <button
        onClick={() => onDelete(msgId)}
        className="w-full text-left px-4 py-2.5 text-[11px] font-black text-red-500/80 hover:text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors uppercase tracking-widest"
      >
        <Trash2 size={13} /> Delete Message
      </button>
      <div className="h-[1px] bg-yellow-500/5 my-1" />
      <button
        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-400 hover:bg-slate-800 flex items-center gap-3 transition-colors uppercase tracking-widest"
      >
        <Copy size={13} /> Copy Text
      </button>
    </div>
  );
}

function ChatListItem({ chat, active, onSelect }: any) {
  return (
    <div onClick={onSelect} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border group relative ${active
      ? 'bg-yellow-500/5 border-yellow-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
      : 'border-transparent hover:bg-slate-800/40'
      }`}>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-500 rounded-r-full shadow-[0_0_10px_#f5c451]" />
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 overflow-hidden ${active
        ? 'bg-yellow-500/20 border-yellow-500/40 shadow-[0_0_15px_rgba(245,196,81,0.2)] scale-105'
        : 'bg-slate-800/60 border-slate-700/50 group-hover:border-slate-500'
        }`}>
        {chat.avatar ? <img src={chat.avatar} className="w-full h-full object-cover" alt="" /> : chat.type === 'dm' ? <User size={18} className={active ? 'text-yellow-500' : 'text-slate-500'} /> : <Users size={18} className={active ? 'text-yellow-500' : 'text-slate-500'} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-[12px] font-bold truncate tracking-tight transition-colors ${active ? 'text-yellow-500' : 'text-slate-300 group-hover:text-white'}`}>
              {chat.name}
            </span>
            {chat.type === 'dm' && (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${chat.status === 'Online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-600'}`} />
            )}
          </div>
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter shrink-0 ml-2">
            {chat.time}
          </span>
        </div>
        <span className={`text-[10px] truncate block font-medium transition-colors ${active ? 'text-yellow-500/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
          {chat.lastMsg}
        </span>
      </div>
    </div>
  );
}

function MessageItem({ msg, currentUserId, contactAvatar, contactName, onDelete, onContextMenu }: any) {
  // Use user_id directly — never rely on pre-computed 'sender' field
  const isSelf = msg.user_id === currentUserId;
  const isSystem = msg.text?.startsWith('SYSTEM:');

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-in fade-in duration-700">
        <div className="bg-yellow-500/5 border border-yellow-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(245,196,81,0.05)]">
          <Shield size={10} className="text-yellow-500/60" />
          <span className="text-[9px] font-black tracking-[0.2em] text-yellow-500/80 uppercase font-mono">
            {msg.text.replace('SYSTEM: ', '')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onContextMenu={(e) => isSelf && onContextMenu(e)}
      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`flex max-w-[85%] md:max-w-[80%] ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5`}>
        {!isSelf && (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mb-1 shadow-inner overflow-hidden">
            {contactAvatar ? (
              <img src={contactAvatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-[10px] font-bold text-slate-400">{contactName?.[0]?.toUpperCase() || '?'}</span>
            )}
          </div>
        )}
        <div className="relative group/bubble">
          <div className={`px-3 py-2 max-md:px-4 max-md:py-2.5 rounded-[18px] max-md:rounded-[20px] text-[13px] max-md:text-[12px] leading-relaxed font-medium transition-all ${isSelf
            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#1a1200] rounded-br-[4px] max-md:rounded-br-none shadow-[0_2px_8px_rgba(245,196,81,0.15)] max-md:shadow-[0_4px_15px_rgba(245,196,81,0.15)] hover:shadow-[0_2px_12px_rgba(245,196,81,0.25)] max-md:hover:shadow-[0_4px_20px_rgba(245,196,81,0.25)]'
            : 'bg-[#1a2333] text-slate-200 rounded-bl-[4px] max-md:rounded-bl-none border border-slate-700/30 max-md:shadow-lg shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:border-slate-600/50'
            }`}>
            {msg.text}
          </div>

          {isSelf && msg.id && (
            <button
              onClick={() => onDelete(msg.id)}
              className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 bg-red-500/5 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover/bubble:opacity-100 transition-all duration-200"
              title="Delete Message"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-1.5 mt-1 max-md:mt-1.5 px-1 max-md:px-2 ${isSelf ? 'justify-end mr-1 max-md:mr-2' : 'justify-start ml-11 max-md:ml-12'}`}>
        <span className="text-[8px] max-md:text-[9px] text-slate-500 max-md:text-slate-600 font-medium max-md:font-bold uppercase tracking-wider max-md:tracking-widest opacity-70 max-md:opacity-60">
          {msg.time}
        </span>
        {isSelf && <div className="w-1 h-1 bg-yellow-500/40 rounded-full ml-0.5" />}
      </div>
    </div>
  );
}
