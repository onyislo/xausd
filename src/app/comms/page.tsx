'use client';

import React, { useState, Suspense, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderPrice from '@/components/HeaderPrice';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/lib/supabase';
import { Phone, CheckCircle, Clock, Link as LinkIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import PhoneCall from '@/components/PhoneCall';

// Extracted Components
import ChatSidebar from '@/components/comms/ChatSidebar';
import ChatWindow from '@/components/comms/ChatWindow';
import Modals from '@/components/comms/Modals';
import ContextMenu from '@/components/comms/ContextMenu';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function CommsContent() {
  const { 
    activeId, setActiveId, chatData, contacts: friends, 
    addContact: addFriend, removeContact: removeFriend, 
    searchProfiles, startDM, sendMessage, deleteMessage, 
    currentUser, pushChannel, typingStatus, setTyping, onlineUsers, sendVoiceNote,
    sendFile, replyingTo, setReplyingTo, isLoading
  } = useChat();

  const [activeCall, setActiveCall] = useState<{ roomId: string, isIncoming: boolean, targetId: string, targetName: string } | null>(null);
  const [incomingRing, setIncomingRing] = useState<{ roomId: string, callerId: string, callerName: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
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
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [devToast, setDevToast] = useState(false);
  const searchParams = useSearchParams();

  const activeChat = chatData.find(c => c.id === activeId) || null;
  const inputText = activeId ? drafts[activeId] || '' : '';
  
  const setInputText = (val: string) => {
    if (activeId) setDrafts(prev => ({ ...prev, [activeId]: val }));
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim(), replyingTo?.id);
    setInputText('');
  };

  const handleCreate = async () => {
    if (!newGroupName.trim() || !currentUser) return;
    const groupName = newGroupName.trim();
    setNewGroupName(''); // Clear immediately to prevent double-clicks

    // Check 10 group limit
    const { count } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', currentUser.id)
      .eq('type', 'group');

    if (count !== null && count >= 10) {
      alert('MAXIMUM 10 HUBS AUTHORIZED PER OPERATIVE.');
      return;
    }
    const { data: channel, error } = await supabase
      .from('channels')
      .insert([{ name: groupName, type: 'group', created_by: currentUser.id }])
      .select().single();
    if (channel) {
      await supabase.from('channel_members').upsert(
        [{ channel_id: channel.id, user_id: currentUser.id }],
        { onConflict: 'channel_id,user_id', ignoreDuplicates: true }
      );
      pushChannel(channel);
      setIsCreating(false);
    } else {
      console.error(error);
      setNewGroupName(groupName); // Restore if failed
    }
  };

  useEffect(() => {
    if (isManaging && activeChat) {
      fetchMembers();
    }
  }, [isManaging, activeId]);

  useEffect(() => {
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

  const joinChannel = async (tokenOrId: string) => {
    let channelId = tokenOrId;
    
    // If it's a short token, resolve it to the channel ID
    if (!tokenOrId.includes('-')) {
      const { data } = await supabase.from('channels').select('id').eq('invite_token', tokenOrId).single();
      if (!data) { alert("Invalid or expired invite link."); return; }
      channelId = data.id;
    }

    // Check 30k member limit
    const { count } = await supabase
      .from('channel_members')
      .select('*', { count: 'exact', head: true })
      .eq('channel_id', channelId);
      
    if (count !== null && count >= 30000) {
      alert('HUB IS AT MAXIMUM CAPACITY (30,000).');
      return;
    }

    const { error } = await supabase
      .from('channel_members')
      .upsert([{ channel_id: channelId, user_id: currentUser.id }], { onConflict: 'channel_id,user_id', ignoreDuplicates: true });
    if (!error) {
      await supabase.from('messages').insert([{
        channel_id: channelId,
        user_id: currentUser.id,
        content: `SYSTEM: ${currentUser.user_metadata?.username || 'A new operative'} joined using an invite link`
      }]);
      window.history.replaceState({}, '', '/comms');
      window.location.reload();
    }
  };

  // Ensure unauthenticated users are redirected to login
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      }
    });
  }, [router]);

  const handleAddMember = async () => {
    if (!inviteEmail.trim() || !activeId) return;

    if (members.length >= 30000) {
      alert('HUB IS AT MAXIMUM CAPACITY (30,000).');
      return;
    }

    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', inviteEmail.trim())
      .single();

    if (user) {
      await supabase.from('channel_members').insert([{ channel_id: activeId, user_id: user.id }]);
      
      await supabase.from('messages').insert([{
        channel_id: activeId,
        user_id: currentUser.id,
        content: `SYSTEM: ${inviteEmail.trim()} was added by ${currentUser.user_metadata?.username || 'Admin'}`
      }]);

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
    const activeChat = chatData.find(c => c.id === activeId);
    const token = activeChat?.invite_token || activeId;
    const link = `${window.location.origin}/comms?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onRightClick = (e: React.MouseEvent, msgId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, msgId });
  };

  useEffect(() => {
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

  useEffect(() => {
    if (!currentUser) return;
    supabase.from('call_logs')
      .select('*, caller:profiles!caller_id(username), callee:profiles!callee_id(username)')
      .or(`caller_id.eq.${currentUser.id},callee_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setCallHistory(data); });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const ringChannel = supabase.channel(`calls:${currentUser.id}`)
      .on('broadcast', { event: 'ring' }, ({ payload }) => setIncomingRing({ roomId: payload.roomId, callerId: payload.callerId, callerName: payload.callerName }))
      .on('broadcast', { event: 'cancel_ring' }, () => setIncomingRing(null))
      .subscribe();
    return () => { supabase.removeChannel(ringChannel); };
  }, [currentUser]);

  const showDevToast = () => {
    setDevToast(true);
    setTimeout(() => setDevToast(false), 2000);
  };

  const startCall = () => {
    if (IS_PRODUCTION) { showDevToast(); return; }
    if (!activeChat || activeChat.type !== 'dm') return;
    const roomId = activeChat.id;
    const targetId = activeChat.otherMemberId;
    const targetName = activeChat.name;
    const callerId = currentUser?.id;
    const callerName = currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'Caller';

    setActiveCall({ roomId, isIncoming: false, targetId, targetName });

    const ringCh = supabase.channel(`calls:${targetId}`);
    ringCh.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        ringCh.send({ type: 'broadcast', event: 'ring', payload: { roomId, callerId, callerName } });
      }
    });
  };

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans flex min-h-screen md:h-screen md:overflow-hidden" style={{ height: '100dvh' }}>
      <Sidebar hideMobileTrigger={!!activeChat} />
      
      <div className="flex-1 flex flex-col min-w-0 p-4 gap-4 overflow-hidden max-md:p-0 max-md:gap-0">
        {/* HEADER */}
        <header className={`
          shrink-0 h-[60px] bg-[#0f1420] border border-yellow-500/10 
          flex justify-between items-center pl-6 pr-6 
          rounded-xl shadow-lg relative
          max-md:h-[52px] max-md:border-0 max-md:border-b max-md:border-yellow-500/10 max-md:rounded-none max-md:pl-14 max-md:pr-3
          ${activeChat ? 'hidden md:flex' : 'flex'}
        `}>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
          <h1 className="text-[16px] font-black tracking-widest text-yellow-500 uppercase max-md:text-[13px]">AuScope | Comms</h1>
          <div className="flex items-center gap-3"><HeaderPrice /></div>
        </header>

        <div className="flex-1 flex gap-0 md:gap-4 min-h-0 overflow-hidden">
          {/* LEFT PANEL */}
          <ChatSidebar 
            tab={tab}
            setTab={setTab}
            chatData={chatData}
            activeId={activeId}
            setActiveId={setActiveId}
            searchResults={searchResults}
            isSearching={isSearching}
            handleSearch={handleSearch}
            handleAddFriend={addFriend}
            onStartDM={onStartDM}
            friends={friends}
            removeFriend={removeFriend}
            callHistory={callHistory}
            currentUser={currentUser}
            setIsCreating={setIsCreating}
            showDevToast={showDevToast}
            IS_PRODUCTION={IS_PRODUCTION}
            onlineUsers={onlineUsers}
            typingStatus={typingStatus}
          />

          {/* CHAT PANEL */}
          <ChatWindow 
            activeChat={activeChat}
            activeId={activeId}
            setActiveId={setActiveId}
            currentUser={currentUser}
            deleteMessage={deleteMessage}
            onRightClick={onRightClick}
            startCall={startCall}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            setIsManaging={setIsManaging}
            copyInviteLink={copyInviteLink}
            handleDeleteChannel={handleDeleteChannel}
            inputText={inputText}
            setInputText={setInputText}
            handleSend={handleSend}
            typingStatus={typingStatus[activeId || ''] || []}
            setTyping={setTyping}
            sendVoiceNote={sendVoiceNote}
            sendFile={sendFile}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
          />
        </div>
      </div>

      <Modals 
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        handleCreate={handleCreate}
        isManaging={isManaging}
        setIsManaging={setIsManaging}
        activeChat={activeChat}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        handleAddMember={handleAddMember}
        copyInviteLink={copyInviteLink}
        copied={copied}
        members={members}
        friends={friends}
        currentUser={currentUser}
        handleRemoveMember={handleRemoveMember}
        handleDeleteChannel={handleDeleteChannel}
      />

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
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping" />
              <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/50 flex items-center justify-center text-3xl font-black text-yellow-400">
                {incomingRing.callerName[0]?.toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-white text-lg font-black uppercase tracking-widest">{incomingRing.callerName}</p>
              <div className="flex items-center gap-2">
                <Phone size={11} className="text-yellow-400 animate-pulse" />
                <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest animate-pulse">Incoming Call...</p>
              </div>
            </div>
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
            if (currentUser) supabase.from('call_logs')
              .select('*, caller:profiles!caller_id(username), callee:profiles!callee_id(username)')
              .or(`caller_id.eq.${currentUser.id},callee_id.eq.${currentUser.id}`)
              .order('created_at', { ascending: false }).limit(20)
              .then(({ data }) => { if (data) setCallHistory(data); });
          }}
        />
      )}

      {devToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[3000] animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="bg-[#0f1420] border border-yellow-500/30 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_40px_rgba(245,196,81,0.05)] overflow-hidden backdrop-blur-xl">
            <div className="flex items-center gap-2.5 px-5 py-3">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center shrink-0">
                <Clock size={13} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.15em] leading-tight">In Development</p>
                <p className="text-[9px] text-slate-500 font-medium tracking-wider">Feature coming soon</p>
              </div>
            </div>
            <div className="h-[2px] bg-slate-800/50">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600" style={{ animation: 'dev-toast-progress 2s linear forwards' }} />
            </div>
          </div>
        </div>
      )}
      {copied && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[3000] bg-green-500/90 text-white px-6 py-3 rounded-xl text-[12px] font-bold tracking-widest uppercase shadow-[0_10px_40px_rgba(34,197,94,0.3)] border border-green-400/30 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-md flex items-center gap-2">
          <LinkIcon size={16} /> Invite Link Copied
        </div>
      )}

      {/* GLOBAL FLOATING AI BUTTON (Mobile Only) */}
      {(!activeId || activeId !== '14a09105-4817-44a5-afae-f2fc26441d13') && tab !== 'ai' && (
        <button 
          onClick={() => {
            onStartDM('14a09105-4817-44a5-afae-f2fc26441d13', 'AuScope AI');
            setTab('ai');
          }}
          className="md:hidden fixed bottom-24 right-4 z-[9999] h-12 pl-1 pr-4 bg-[#0a0e17] border border-yellow-500/30 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,196,81,0.2)] flex items-center gap-2.5 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" />
              <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" />
              <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" />
            </svg>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-yellow-500">AuScope AI</span>
        </button>
      )}
    </main>
  );
}

export default function CommsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0e17]"><div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>}>
      <CommsContent />
    </Suspense>
  );
}
