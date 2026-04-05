'use client';

import React, { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderPrice from '@/components/HeaderPrice';
import { useChat } from '@/hooks/useChat';
import { Search, Send, FileText, Image as ImageIcon, Bot, Users, User, Phone, MoreVertical, Plus, Trash2 } from 'lucide-react';

export default function CommsPage() {
  const { activeId, setActiveId, chatData, sendMessage, currentUser } = useChat();
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [isCalling, setIsCalling] = useState(false);
  
  const activeChat = chatData.find(c => c.id === activeId) || chatData[0] || null;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 p-4 gap-4 overflow-hidden">
        
        {/* ── HEADER ── */}
        <header className="shrink-0 h-[60px] bg-[#0f1420] border border-yellow-500/10 flex justify-between items-center px-6 rounded-xl shadow-lg relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent"></div>
          <div className="flex items-center gap-4">
            <h1 className="text-[16px] font-black tracking-widest text-yellow-500 uppercase">AuScope | Comms</h1>
          </div>
          <div className="flex items-center gap-6"><HeaderPrice /></div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex gap-4 min-h-0">
          
          {/* SIDEBAR: Channels */}
          <section className="w-[300px] bg-[#0f1420] border border-yellow-500/20 rounded-xl flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-yellow-500/10 flex flex-col gap-4">
               <span className="text-[11px] text-yellow-500 font-bold uppercase tracking-widest">Secure Comms Array</span>
               <button className="flex items-center justify-center gap-2 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-[10px] font-bold uppercase tracking-widest hover:bg-yellow-500/20 transition-all">
                  <Plus size={14} /> Initialize Channel
               </button>
               <div className="relative">
                 <input className="w-full bg-[#0a0e17] border border-slate-700 text-xs px-8 py-2 rounded" placeholder="Search..." />
                 <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
               {chatData.map(chat => (
                 <ChatListItem key={chat.id} chat={chat} active={activeId === chat.id} onSelect={() => setActiveId(chat.id)} />
               ))}
            </div>
          </section>

          {/* ACTIVE CHAT */}
          <section className="flex-1 bg-[#0f1420] border border-yellow-500/20 rounded-xl flex flex-col overflow-hidden relative shadow-2xl">
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                <Users size={64} className="opacity-20 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">No Active Comms Detected</span>
                <span className="text-[9px] uppercase tracking-widest opacity-30 italic">Initialize a channel to begin secure transmission</span>
              </div>
            ) : (
              <>
                {/* Chat Head */}
                <div className="h-[70px] border-b border-yellow-500/10 flex justify-between items-center px-6 shrink-0 bg-slate-800/40">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/10 text-yellow-500">
                      {activeChat.type === 'ai' ? <Bot size={20} /> : <User size={20} />}
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-sm font-bold text-slate-200">{activeChat.name}</h2>
                      <span className="text-[10px] text-green-400">{activeChat.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <Phone size={18} className="cursor-pointer hover:text-yellow-500 transition-colors" onClick={() => setIsCalling(true)} />
                    <MoreVertical size={18} />
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#0a0e17] custom-scrollbar">
                  {activeChat.messages?.map((msg: any, i: number) => <MessageItem key={i} msg={msg} />)}
                </div>

                {/* Input */}
                <div className="p-4 bg-[#0f1420] border-t border-slate-800">
                  <div className="bg-[#0a0e17] border border-slate-700 rounded-xl flex items-center p-2 focus-within:border-yellow-500/50 transition-all">
                    <div className="flex gap-2 px-2 text-slate-400">
                      <ImageIcon size={18} className="cursor-pointer hover:text-white" />
                    </div>
                    <input 
                      className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none px-2" 
                      placeholder="Send message..." 
                      value={inputText} 
                      onChange={e => setInputText(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleSend()} 
                    />
                    <button 
                      className="w-10 h-10 bg-yellow-500 hover:bg-yellow-400 text-[#1a1200] rounded-lg flex items-center justify-center transition-all shadow-lg active:scale-95" 
                      onClick={handleSend}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}

{/* ── SUB-COMPONENTS FOR CLEANLINESS ── */}

function ChatListItem({ chat, active, onSelect }: any) {
  return (
    <div onClick={onSelect} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${active ? 'bg-slate-800 border-slate-600 shadow-md' : 'border-transparent hover:bg-slate-800/40 text-slate-400'}`}>
      <div className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center shrink-0">
        {chat.type === 'ai' ? <Bot size={18} className="text-blue-400" /> : <User size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold truncate text-slate-300">{chat.name}</span>
          <span className="text-[9px] text-slate-500">{chat.time}</span>
        </div>
        <span className="text-[10px] text-slate-400 truncate block">{chat.lastMsg}</span>
      </div>
    </div>
  );
}

function MessageItem({ msg }: any) {
  const isSelf = msg.sender === 'User';
  return (
    <div className={`flex max-w-[80%] ${isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto'} gap-3 items-end`}>
      <div className={`px-4 py-2 rounded-2xl text-sm ${isSelf ? 'bg-yellow-500 text-[#1a1200] rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
        {msg.text}
        <div className={`text-[8px] mt-1 opacity-50 ${isSelf ? 'text-right' : 'text-left'}`}>{msg.time}</div>
      </div>
    </div>
  );
}
