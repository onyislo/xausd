'use client';
import React from 'react';
import { Hash, Shield, MessageSquare, Users, Phone, Bot, Search, Plus, UserPlus, PhoneMissed, PhoneOutgoing, PhoneIncoming, MessageSquare as MessageIcon, Trash2 } from 'lucide-react';
import ChatListItem from './ChatListItem';

interface ChatSidebarProps {
  tab: string;
  setTab: (tab: any) => void;
  chatData: any[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  searchResults: any[];
  isSearching: boolean;
  handleSearch: (val: string) => void;
  handleAddFriend: (id: string) => void;
  onStartDM: (uid: string, username?: string) => void;
  friends: any[];
  removeFriend: (id: string) => void;
  callHistory: any[];
  currentUser: any;
  setIsCreating: (val: boolean) => void;
  showDevToast: () => void;
  IS_PRODUCTION: boolean;
  onlineUsers: Set<string>;
}

export default function ChatSidebar({
  tab,
  setTab,
  chatData,
  activeId,
  setActiveId,
  searchResults,
  isSearching,
  handleSearch,
  handleAddFriend,
  onStartDM,
  friends,
  removeFriend,
  callHistory,
  currentUser,
  setIsCreating,
  showDevToast,
  IS_PRODUCTION,
  onlineUsers
}: ChatSidebarProps) {
  
  const filtered = tab === 'all'
    ? chatData.filter(c => c.type === 'group' || c.type === 'dm')
    : tab === 'channels'
      ? chatData.filter(c => c.type === 'group')
      : tab === 'dms'
        ? chatData.filter(c => c.type === 'dm')
        : chatData.filter(c => c.type === 'ai');

  return (
    <section className={`
      flex flex-col shrink-0 overflow-hidden bg-[#0f1420] border-0 
      md:border-yellow-500/20 w-full md:w-[290px] rounded-none md:rounded-xl
      ${activeId ? 'hidden md:flex' : 'flex max-md:flex-1'}
    `}>

      {/* Tabs */}
      <div className="flex shrink-0 md:border-b md:border-yellow-500/10 md:p-1 md:bg-transparent
        max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-30
        max-md:bg-[#0a0e17] max-md:border-t max-md:border-yellow-500/15
        max-md:px-2 max-md:pt-2 max-md:pb-[max(0.5rem,env(safe-area-inset-bottom))]
        max-md:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {([
          { key: 'all', icon: <Hash size={18} />, title: 'All' },
          { key: 'channels', icon: <Shield size={18} />, title: 'Groups' },
          { key: 'dms', icon: <MessageSquare size={18} />, title: 'DMs' },
          { key: 'friends', icon: <Users size={18} />, title: 'Friends' },
          { key: 'calls', icon: <Phone size={18} />, title: 'Calls' },
          { key: 'ai', icon: <Bot size={18} />, title: 'AI' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 md:py-2 md:flex-row md:gap-0 md:rounded-lg transition-all duration-200 ${tab === t.key
              ? 'text-yellow-500 md:bg-yellow-500/10'
              : 'text-slate-500 hover:text-slate-300 md:hover:bg-slate-800/30'
              }`}
          >
            <div className={`transition-transform duration-200 ${tab === t.key ? 'scale-110' : 'scale-100'}`}>
              {t.icon}
            </div>
            <span className="md:hidden text-[9px] font-bold uppercase tracking-wide mt-0.5">{t.title}</span>
          </button>
        ))}
      </div>

      {/* Search + Create */}
      <div className="p-3 flex gap-2 border-b border-yellow-500/10 shrink-0 bg-slate-900/20 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar max-md:pb-20">
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
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${onlineUsers.has(u.id) ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-600'} border-2 border-[#0f1420] rounded-full`} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 truncate">{u.username}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!friends.some((f: any) => f.id === u.id) && (
                    <button onClick={() => handleAddFriend(u.id)} className="p-1.5 text-slate-500 hover:text-yellow-500 transition-colors" title="Add Friend"><UserPlus size={14} /></button>
                  )}
                  <button onClick={() => onStartDM(u.id, u.username)} className="p-1.5 text-slate-500 hover:text-green-500 transition-colors" title="Message"><MessageIcon size={14} /></button>
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
            friends.map(f => {
              const isOnline = onlineUsers.has(f.id);
              
              return (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-700/50 group transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400">{f.username?.[0]?.toUpperCase()}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${isOnline ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'} border-2 border-[#0f1420] rounded-full shadow-lg`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-slate-200 truncate">{f.username}</div>
                      <div className={`text-[9px] ${isOnline ? 'text-green-500/70' : 'text-slate-500'} font-bold uppercase tracking-tighter`}>
                        {isOnline ? 'Encrypted Connection' : 'Signal Lost'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onStartDM(f.id, f.username)} className="p-2 text-slate-400 hover:text-yellow-500"><MessageIcon size={18} /></button>
                    <button onClick={() => removeFriend(f.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              );
            })
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
            <ChatListItem key={chat.id} chat={chat} active={activeId === chat.id} onSelect={() => {
              setActiveId(chat.id);
            }} />
          ))
        )}
      </div>
    </section>
  );
}
