'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Trash2, Mic, ChevronDown, Copy, Reply } from 'lucide-react';

export default function MessageItem({ msg, currentUserId, contactAvatar, contactName, onDelete, onReply, onContextMenu }: any) {
  const isSelf = msg.user_id === currentUserId;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuUp, setMenuUp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMenu && bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuUp(spaceBelow < 200); // If less than 200px space below, flip the menu to open upwards
    }
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    if (showMenu) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showMenu]);

  if (msg.text?.startsWith('SYSTEM:')) return (
    <div className="flex justify-center my-4"><div className="bg-yellow-500/5 border border-yellow-500/20 px-4 py-1.5 rounded-full flex items-center gap-2"><Shield size={10} className="text-yellow-500/60" /><span className="text-[9px] font-black tracking-widest text-yellow-500 uppercase">{msg.text.replace('SYSTEM: ', '')}</span></div></div>
  );

  const displayText = (msg.text || '').length > 700 && !isExpanded ? msg.text.slice(0, 700) + '...' : msg.text;

  return (
    <div className={`w-full flex flex-col ${isSelf ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300 relative`}>
      <div className={`flex w-full ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5 px-2`}>
        {!isSelf && <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mb-1 overflow-hidden">{contactAvatar ? <img src={contactAvatar} className="w-full h-full object-cover" alt="" /> : <span className="text-[10px] font-bold text-slate-400">{contactName?.[0]?.toUpperCase()}</span>}</div>}
        
        <div ref={bubbleRef} className="relative group/bubble flex max-w-[85%] md:max-w-[70%]">
          <div className={`px-4 py-2.5 rounded-[18px] text-[13px] leading-relaxed shadow-sm relative overflow-hidden ${isSelf ? 'bg-[#241d0b] text-yellow-50/90 rounded-br-none border border-yellow-500/20' : 'bg-[#161b22] text-slate-200 rounded-bl-none border border-slate-700/30'}`}>
            <div className="absolute top-0 right-0 h-8 w-8 bg-gradient-to-bl from-black/40 to-transparent opacity-0 group-hover/bubble:opacity-100 transition-opacity pointer-events-none z-10 max-md:hidden" />
            <button onClick={toggleMenu} className="absolute top-0.5 right-0.5 p-1 text-white/40 hover:text-white transition-all opacity-0 group-hover/bubble:opacity-100 max-md:hidden z-20"><ChevronDown size={16} /></button>

            {msg.reply_to && (
              <div className="mb-2 p-2 bg-black/30 rounded-lg border-l-4 border-yellow-500/50 text-[11px] opacity-80 truncate">
                <div className="font-bold text-yellow-500/80 mb-0.5">{msg.reply_to.user_id === currentUserId ? 'You' : contactName}</div>
                {msg.reply_to.content}
              </div>
            )}
            
            {msg.text?.startsWith('[VOICE_NOTE]') ? (
              <div className="flex flex-col gap-1.5 min-w-[200px] py-1"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500/80"><Mic size={10} className="animate-pulse" /><span>Voice Note</span></div><audio controls className="h-8 invert brightness-125 opacity-70 w-full"><source src={msg.text.replace('[VOICE_NOTE]', '')} /></audio></div>
            ) : <span className="pr-2">{displayText}{(msg.text || '').length > 700 && <button onClick={() => setIsExpanded(!isExpanded)} className="block mt-2 text-[10px] font-black text-yellow-500">{isExpanded ? 'LESS' : 'MORE'}</button>}</span>}
          </div>

          {showMenu && (
            <div ref={menuRef} className={`absolute z-[1000] w-36 bg-[#1c212d] border border-white/10 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] py-1 animate-in fade-in zoom-in-95 duration-100 ${isSelf ? 'right-full mr-2' : 'left-full ml-2'} ${menuUp ? 'bottom-0 mb-2' : 'top-0 mt-2'}`}>
              <button onClick={() => { onReply(msg); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-[10px] font-bold text-slate-200 hover:bg-white/5 uppercase tracking-wider"><Reply size={13} className="text-yellow-500/50" /> Reply</button>
              <button onClick={() => { navigator.clipboard.writeText(msg.text || ''); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-[10px] font-bold text-slate-200 hover:bg-white/5 uppercase tracking-wider"><Copy size={13} className="text-yellow-500/50" /> Copy</button>
              {isSelf && <button onClick={() => { onDelete(msg.id); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-[10px] font-bold text-red-500/80 hover:bg-red-500/10 border-t border-white/5 mt-0.5 pt-1.5 uppercase tracking-wider"><Trash2 size={13} /> Delete</button>}
            </div>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-1.5 mt-1 px-1 ${isSelf ? 'justify-end mr-1' : 'justify-start ml-11'}`}>
        <span className="text-[8px] text-slate-500 font-medium uppercase tracking-wider opacity-70">{msg.time}</span>
        {isSelf && <div className="w-1 h-1 bg-yellow-500/40 rounded-full" />}
      </div>
    </div>
  );
}
