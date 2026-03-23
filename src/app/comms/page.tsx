'use client';

import React, { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderPrice from '@/components/HeaderPrice';
import { Search, Send, FileText, Image as ImageIcon, Bot, Users, User, Phone, MoreVertical, Plus, Trash2 } from 'lucide-react';

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
  },
  {
    id: 'group1',
    type: 'group',
    name: 'XAU Bulls Network',
    status: '14,204 Members • 342 Online',
    lastMsg: 'London session opening strong, watch R1 at 2,335.',
    time: '2m ago',
    messages: [
      { sender: 'Mike_T', text: 'Anyone catching this bid under 2,320?', time: '08:45 AM' },
      { sender: 'Sarah_Macro', text: 'Careful, DXY is heavily consolidated here. Wait for the CPI print tomorrow before sizing up.', time: '08:50 AM' },
      { sender: 'User', text: 'London session opening strong, watch R1 at 2,335.', time: '08:58 AM' }
    ]
  },
  {
    id: 'dm1',
    type: 'dm',
    name: 'Alex (Risk Coordinator)',
    status: 'Away • Last seen 1h ago',
    lastMsg: 'Did you review yesterday\'s drawdown report?',
    time: '1h ago',
    messages: [
      { sender: 'Alex', text: 'Hey, I sent over the exposure limits for your new portfolio.', time: 'Yesterday' },
      { sender: 'Alex', text: 'Did you review yesterday\'s drawdown report?', time: '1h ago' }
    ]
  }
];

export default function CommsPage() {
  const [activeId, setActiveId] = useState('ai');
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [chatData, setChatData] = useState(INITIAL_CHAT_DATA);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chatData.find(c => c.id === activeId) || chatData[0];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMsg = {
      sender: 'User',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setChatData(prev => prev.map(chat => {
      if (chat.id === activeId) {
        return {
          ...chat,
          lastMsg: newMsg.text.length > 30 ? newMsg.text.substring(0, 30) + '...' : newMsg.text,
          time: 'Just now',
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    }));

    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = type === 'image' ? URL.createObjectURL(file) : undefined;

    const newMsg = {
      sender: 'User',
      text: file.name,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isImage: type === 'image',
      isPdf: type === 'pdf',
      fileUrl
    };

    setChatData(prev => prev.map(chat => {
      if (chat.id === activeId) {
        return {
          ...chat,
          lastMsg: type === 'image' ? 'Sent an image 🖼️' : 'Sent a document 📄',
          time: 'Just now',
          messages: [...chat.messages, newMsg as any]
        };
      }
      return chat;
    }));

    if (e.target) e.target.value = '';
  };

  const handleDeleteMessage = (msgIndex: number) => {
    setChatData(prev => prev.map(chat => {
      if (chat.id === activeId) {
        const newMessages = chat.messages.filter((_, i) => i !== msgIndex);
        const last = newMessages[newMessages.length - 1];
        
        let newLastMsg = 'No messages yet';
        if (last) {
          if ((last as any).isImage) newLastMsg = 'Sent an image 🖼️';
          else if ((last as any).isPdf) newLastMsg = 'Sent a document 📄';
          else newLastMsg = last.text.length > 30 ? last.text.substring(0, 30) + '...' : last.text;
        }

        return {
          ...chat,
          messages: newMessages,
          lastMsg: newLastMsg
        };
      }
      return chat;
    }));
  };

  const getIcon = (type: string) => {
    if (type === 'ai') return <Bot size={18} className="text-blue-400" />;
    if (type === 'group') return <Users size={18} className="text-yellow-500" />;
    return <User size={18} className="text-slate-400" />;
  };

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0a0e17] p-4 gap-4">
        
        {/* ── HEADER ── */}
        <header className="shrink-0 h-[60px] relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 flex justify-between items-center px-6 border border-slate-800/60 rounded-xl shadow-lg">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>

          <div className="flex items-center gap-4 z-10">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-[16px] font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  AuScope
                </h1>
                <span className="text-slate-500 text-[11px] tracking-widest uppercase font-semibold">|</span>
                <span className="text-[13px] text-slate-300 tracking-[0.2em] uppercase font-bold" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Comms Network</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-slate-500 tracking-[0.2em] uppercase">Encrypted</span>
                <span className="text-[9px] text-slate-700">•</span>
                <span className="text-[9px] text-slate-500 tracking-[0.2em] uppercase">Global Channels</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 z-10">
            <HeaderPrice />
            <div className="h-8 w-px bg-slate-700/60"></div>
            <div className="flex items-center gap-4 mr-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Node</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT (COMMS HUB) ── */}
        <div className="flex-1 min-h-0 flex gap-4">
          
          {/* LEFT: Channel List */}
          <div className="w-[300px] xl:w-[350px] bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden shadow-2xl flex flex-col shrink-0">
            <div className="p-4 bg-slate-800/80 border-b border-yellow-500/10 flex flex-col shrink-0">
               <span className="text-[11px] text-yellow-500 font-bold uppercase tracking-[0.15em] mb-4">Secure Comms Array</span>
               
               {isCreating ? (
                 <div className="flex flex-col gap-2 p-3 bg-slate-900 border border-yellow-500/30 rounded-lg mb-4">
                   <input 
                     type="text" 
                     placeholder="Enter Group Name..." 
                     value={newGroupName}
                     onChange={e => setNewGroupName(e.target.value)}
                     className="w-full bg-[#0a0e17] text-xs text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-yellow-500/50"
                     autoFocus
                   />
                   <div className="flex gap-2">
                     <button 
                       onClick={() => {
                         if (newGroupName.trim()) {
                           const newChat = {
                             id: 'group-' + Date.now(),
                             type: 'group',
                             name: newGroupName.trim(),
                             status: '1 Member • Just Created',
                             lastMsg: 'Group initialized',
                             time: 'Just now',
                             messages: [{ sender: 'System', text: `Welcome to ${newGroupName.trim()}. End-to-end encryption is active.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]
                           };
                           setChatData([newChat, ...chatData]);
                           setActiveId(newChat.id);
                           setNewGroupName('');
                           setIsCreating(false);
                         }
                       }}
                       className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-[#1a1200] text-[10px] font-bold py-1.5 rounded transition-colors"
                     >
                       CREATE
                     </button>
                     <button 
                       onClick={() => { setIsCreating(false); setNewGroupName(''); }}
                       className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold py-1.5 rounded transition-colors"
                     >
                       CANCEL
                     </button>
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={() => setIsCreating(true)}
                   className="w-full flex items-center justify-center gap-2 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-500 transition-colors mb-4"
                 >
                   <Plus size={14} strokeWidth={2.5} />
                   <span className="text-[10px] font-bold tracking-widest uppercase">Initialize New Channel</span>
                 </button>
               )}

               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Search channels, messages, AI data..." 
                   className="w-full bg-[#0a0e17] border border-slate-700 text-xs text-slate-200 px-8 py-2 rounded focus:outline-none focus:border-yellow-500/50 transition-colors"
                 />
                 <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
               {/* Channel Types Filtering */}
               <div className="flex gap-2 mb-2 px-2">
                 {['all', 'ai', 'group', 'dm'].map(f => (
                   <span 
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`text-[9px] font-bold tracking-widest uppercase pb-1 cursor-pointer transition-colors ${
                       filter === f 
                         ? 'text-yellow-500 border-b-2 border-yellow-500' 
                         : 'text-slate-500 hover:text-slate-300'
                     }`}
                   >
                     {f === 'ai' ? 'AI Int' : f === 'group' ? 'Groups' : f === 'dm' ? 'Direct' : 'All'}
                   </span>
                 ))}
               </div>

               {/* Chat List */}
               {chatData.filter(c => filter === 'all' || c.type === filter).map(chat => (
                 <div 
                   key={chat.id}
                   onClick={() => setActiveId(chat.id)}
                   className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                     activeId === chat.id 
                       ? 'bg-slate-800/80 border-slate-600 shadow-lg' 
                       : 'bg-transparent border-transparent hover:bg-slate-800/40 text-slate-400'
                   }`}
                 >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                     chat.type === 'ai' ? 'bg-blue-500/10 border-blue-500/30' : 
                     chat.type === 'group' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-slate-700/50 border-slate-600'
                   }`}>
                     {getIcon(chat.type)}
                   </div>
                   <div className="flex flex-col flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-1">
                       <span className={`text-xs font-bold truncate ${activeId === chat.id ? 'text-slate-200' : 'text-slate-300'}`}>{chat.name}</span>
                       <span className={`text-[9px] ${activeId === chat.id ? 'text-yellow-500' : 'text-slate-500'}`}>{chat.time}</span>
                     </div>
                     <span className="text-[10px] text-slate-400 truncate">{chat.lastMsg}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* RIGHT: Active Chat Interface */}
          <div className="flex-1 flex flex-col bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Chat Header */}
            <div className="h-[70px] bg-slate-800/80 border-b border-yellow-500/10 flex justify-between items-center px-6 shrink-0 z-10">
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                    activeChat.type === 'ai' ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 
                    activeChat.type === 'group' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-slate-700/50 border-slate-600'
                 }`}>
                   {getIcon(activeChat.type)}
                 </div>
                 <div className="flex flex-col">
                   <h2 className="text-sm font-bold text-slate-200 tracking-wide">{activeChat.name}</h2>
                   <span className={`text-[10px] mt-0.5 ${activeChat.type === 'ai' ? 'text-blue-400' : 'text-green-400'}`}>{activeChat.status}</span>
                 </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <Phone size={18} className="cursor-pointer hover:text-white transition-colors" />
                <MoreVertical size={18} className="cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#0a0e17] custom-scrollbar relative">
               {/* Background Watermark */}
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                 <Users size={400} />
               </div>

               <div className="text-center mt-2 mb-4">
                 <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">Today</span>
               </div>

               {activeChat.messages.map((msg, i) => {
                 const isSelf = msg.sender === 'User';
                 const isAI = msg.sender === 'AI';
                 
                 return (
                   <div key={i} className={`flex max-w-[80%] ${isSelf ? 'ml-auto flex-row-reverse group/msg' : 'mr-auto'} gap-3 items-end`}>
                     {/* Avatar (hide for self) */}
                     {!isSelf && (
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                         isAI ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-slate-700 border-slate-600 text-slate-300'
                       }`}>
                         {isAI ? <Bot size={14} /> : <User size={14} />}
                       </div>
                     )}
                     
                     <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} relative`}>
                       {!isSelf && <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.sender}</span>}
                       <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative ${
                         isSelf 
                           ? 'bg-gradient-to-br from-yellow-600 to-yellow-500 text-[#1a1200] rounded-br-sm shadow-md' 
                           : isAI 
                           ? 'bg-[#131d2e] border border-blue-500/30 text-blue-100 rounded-bl-sm shadow-md'
                           : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm shadow-md'
                       }`}>
                         {/* Trash Button for User Messages */}
                         {isSelf && (
                           <button 
                             onClick={() => handleDeleteMessage(i)}
                             className="absolute top-1/2 -translate-y-1/2 -left-8 text-slate-600 hover:text-red-500 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 bg-[#0a0e17] border border-slate-700/50 rounded-full shadow-lg"
                             title="Delete Message"
                           >
                             <Trash2 size={12} />
                           </button>
                         )}

                         {(msg as any).isImage ? (
                           <div className="flex flex-col gap-2">
                             <img src={(msg as any).fileUrl} alt={msg.text} className="max-w-[200px] rounded-lg border border-black/10" />
                             <span className="text-[10px] opacity-70 font-mono">{msg.text}</span>
                           </div>
                         ) : (msg as any).isPdf ? (
                           <div className="flex items-center gap-2 bg-black/10 p-2 rounded-lg border border-black/10">
                             <FileText size={24} className="opacity-80" />
                             <div className="flex flex-col">
                               <span className="font-bold truncate max-w-[150px]">{msg.text}</span>
                               <span className="text-[9px] opacity-70 uppercase tracking-widest">PDF Document</span>
                             </div>
                           </div>
                         ) : (
                           msg.text
                         )}
                       </div>
                       <span className="text-[9px] text-slate-500 mt-1">{msg.time}</span>
                     </div>
                   </div>
                 );
               })}
            </div>

            {/* Input Box */}
            <div className="p-4 bg-[#0f1420] border-t border-slate-800 shrink-0">
               <div className="bg-[#0a0e17] border border-slate-700 rounded-xl flex items-center p-2 focus-within:border-yellow-500/50 transition-colors shadow-inner">
                 <div className="flex gap-2 px-2 text-slate-400">
                    <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={e => handleFileUpload(e, 'image')} />
                    <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={e => handleFileUpload(e, 'pdf')} />
                    <ImageIcon size={18} className="cursor-pointer hover:text-white transition-colors" onClick={() => imageInputRef.current?.click()} />
                    <FileText size={18} className="cursor-pointer hover:text-white transition-colors" onClick={() => fileInputRef.current?.click()} />
                 </div>
                 <div className="h-6 w-px bg-slate-700/60 mx-2"></div>
                 <input 
                   type="text" 
                   className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none px-2"
                   placeholder={activeChat.type === 'ai' ? "Ask AuScope AI for analysis..." : "Type your message..."}
                   value={inputText}
                   onChange={e => setInputText(e.target.value)}
                   onKeyDown={e => {
                     if (e.key === 'Enter') handleSendMessage();
                   }}
                 />
                 <button 
                   className="w-10 h-10 bg-yellow-500 hover:bg-yellow-400 text-[#1a1200] rounded-lg flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(245,196,81,0.3)] ml-2 shrink-0"
                   onClick={handleSendMessage}
                 >
                   <Send size={16} className="ml-0.5" />
                 </button>
               </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
