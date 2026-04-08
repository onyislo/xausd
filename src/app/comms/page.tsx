'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderPrice from '@/components/HeaderPrice';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/lib/supabase';
import { Search, Send, Users, User, Phone, MoreVertical, Plus } from 'lucide-react';

export default function CommsPage() {
  const { activeId, setActiveId, chatData, sendMessage, currentUser, pushChannel } = useChat();
  const [inputText, setInputText] = useState('');
  const [tab, setTab] = useState<'channels' | 'dms' | 'ai'>('channels');
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const activeChat = chatData.find(c => c.id === activeId) || null;
  const filtered = tab === 'channels'
    ? chatData.filter(c => c.type === 'group')
    : tab === 'dms'
    ? chatData.filter(c => c.type === 'dm')
    : chatData.filter(c => c.type === 'ai');

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleCreate = async () => {
    if (!newGroupName.trim() || !currentUser) return;
    const { data: channel, error } = await supabase
      .from('channels')
      .insert([{ name: newGroupName.trim(), type: 'group' }])
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

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 p-4 gap-4 overflow-hidden">

        {/* HEADER */}
        <header className="shrink-0 h-[60px] bg-[#0f1420] border border-yellow-500/10 flex justify-between items-center px-6 rounded-xl shadow-lg relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
          <h1 className="text-[16px] font-black tracking-widest text-yellow-500 uppercase">AuScope | Comms</h1>
          <div className="flex items-center gap-6"><HeaderPrice /></div>
        </header>

        <div className="flex-1 flex gap-4 min-h-0">

          {/* LEFT PANEL */}
          <section className="w-[290px] bg-[#0f1420] border border-yellow-500/20 rounded-xl flex flex-col shrink-0 overflow-hidden">

            {/* Tabs — compact icons */}
            <div className="flex border-b border-yellow-500/10 shrink-0">
              {([
                { key: 'channels', label: '#', title: 'Channels' },
                { key: 'dms',      label: '💬', title: 'Direct'  },
                { key: 'ai',       label: '🤖', title: 'AI Chat' },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} title={t.title}
                  className={`flex-1 py-2.5 text-sm font-black transition-all ${
                    tab === t.key
                      ? 'text-yellow-500 border-b-2 border-yellow-500 bg-yellow-500/5'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search + Create */}
            <div className="p-3 flex gap-2 border-b border-yellow-500/10 shrink-0">
              <div className="relative flex-1">
                <input className="w-full bg-[#0a0e17] border border-slate-700 text-xs px-7 py-2 rounded-lg" placeholder="Search..." />
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
              </div>
              {tab === 'channels' && (
                <button onClick={() => setIsCreating(true)}
                  className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 hover:bg-yellow-500/20 transition-all">
                  <Plus size={15} />
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                  <span className="text-2xl">{tab === 'ai' ? '🤖' : tab === 'dms' ? '💬' : '#'}</span>
                  <span className="text-[10px] uppercase tracking-widest text-center px-4">
                    {tab === 'channels' ? 'No channels yet. Hit + to create one.' : tab === 'dms' ? 'No direct messages yet.' : 'No AI sessions yet.'}
                  </span>
                </div>
              ) : filtered.map(chat => (
                <ChatListItem key={chat.id} chat={chat} active={activeId === chat.id} onSelect={() => setActiveId(chat.id)} />
              ))}
            </div>
          </section>

          {/* CHAT PANEL */}
          <section className="flex-1 bg-[#0f1420] border border-yellow-500/20 rounded-xl flex flex-col overflow-hidden shadow-2xl">
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                <Users size={56} className="opacity-20 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">No Active Comms Detected</span>
                <span className="text-[9px] uppercase tracking-widest opacity-30">Select a channel to begin</span>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="h-[64px] border-b border-yellow-500/10 flex justify-between items-center px-6 shrink-0 bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/10 text-yellow-500">
                      {activeChat.type === 'dm' ? <User size={18} /> : <Users size={18} />}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">{activeChat.name}</h2>
                      <span className="text-[10px] text-green-400">{activeChat.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <Phone size={17} className="cursor-pointer hover:text-yellow-500 transition-colors" />
                    <MoreVertical size={17} />
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#0a0e17] custom-scrollbar">
                  {activeChat.messages?.map((msg: any, i: number) => <MessageItem key={i} msg={msg} />)}
                </div>

                {/* Input */}
                <div className="p-3 bg-[#0f1420] border-t border-slate-800">
                  <div className="bg-[#0a0e17] border border-slate-700 rounded-xl flex items-center p-2 focus-within:border-yellow-500/50 transition-all">
                    <input
                      className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none px-3"
                      placeholder="Send encrypted message..."
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
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
    </main>
  );
}

function ChatListItem({ chat, active, onSelect }: any) {
  return (
    <div onClick={onSelect} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
      active ? 'bg-slate-800 border-slate-600' : 'border-transparent hover:bg-slate-800/40'
    }`}>
      <div className="w-9 h-9 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center shrink-0 text-slate-400">
        {chat.type === 'dm' ? <User size={16} /> : <Users size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-xs font-bold truncate text-slate-300">{chat.name}</span>
          <span className="text-[9px] text-slate-500 shrink-0 ml-1">{chat.time}</span>
        </div>
        <span className="text-[10px] text-slate-500 truncate block">{chat.lastMsg}</span>
      </div>
    </div>
  );
}

function MessageItem({ msg }: any) {
  const isSelf = msg.sender === 'User';
  return (
    <div className={`flex max-w-[75%] ${isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto'} items-end`}>
      <div className={`px-4 py-2 rounded-2xl text-sm ${
        isSelf ? 'bg-yellow-500 text-[#1a1200] rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
      }`}>
        {msg.text}
        <div className={`text-[8px] mt-1 opacity-50 ${isSelf ? 'text-right' : 'text-left'}`}>{msg.time}</div>
      </div>
    </div>
  );
}
