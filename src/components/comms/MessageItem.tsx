'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Trash2, Mic, ChevronDown, Copy, Reply } from 'lucide-react';

export default function MessageItem({ msg, currentUserId, contactAvatar, contactName, onDelete, onReply, onContextMenu }: any) {
  const isSelf = msg.user_id === currentUserId;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    if (showMenu) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showMenu]);

  if (msg.text?.startsWith('SYSTEM:')) return (
    <div className="flex justify-center my-4"><div className="bg-yellow-500/5 border border-yellow-500/20 px-4 py-1.5 rounded-full flex items-center gap-2"><Shield size={10} className="text-yellow-500/60" /><span className="text-[9px] font-black tracking-widest text-yellow-500 uppercase">{msg.text.replace('SYSTEM: ', '')}</span></div></div>
  );

  const isLong = (msg.text || '').length > 700;
  const displayText = isLong && !isExpanded ? msg.text.slice(0, 700) + '...' : msg.text;

  return (
    <div className={`w-full flex flex-col ${isSelf ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300 relative`}>
      <div className={`flex w-full ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5 px-2`}>
        {!isSelf && <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mb-1 overflow-hidden">{contactAvatar ? <img src={contactAvatar} className="w-full h-full object-cover" alt="" /> : <span className="text-[10px] font-bold text-slate-400">{contactName?.[0]?.toUpperCase()}</span>}</div>}
        
        <div className="relative group/bubble flex max-w-[85%] md:max-w-[70%]">
          <div className={`px-4 py-2.5 rounded-[18px] text-[13px] leading-relaxed shadow-sm relative ${isSelf ? 'bg-[#241d0b] text-yellow-50/90 rounded-br-none border border-yellow-500/20' : 'bg-[#161b22] text-slate-200 rounded-bl-none border border-slate-700/30'}`}>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="absolute top-1 right-1 p-1 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all opacity-0 group-hover/bubble:opacity-100 max-md:hidden z-30"
            >
              <ChevronDown size={15} />
            </button>

            {msg.reply_to && (
              <div className="mb-2 p-2 bg-black/30 rounded-lg border-l-4 border-yellow-500/50 text-[11px] opacity-80 truncate">
                <div className="font-bold text-yellow-500/80 mb-0.5">{msg.reply_to.user_id === currentUserId ? 'You' : contactName}</div>
                {msg.reply_to.content}
              </div>
            )}
            
            {msg.text?.startsWith('[VOICE_NOTE]') ? (
              <div className="flex flex-col gap-1.5 min-w-[200px] py-1"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500/80"><Mic size={10} className="animate-pulse" /><span>Voice Note</span></div><audio controls className="h-8 invert brightness-125 opacity-70 w-full"><source src={msg.text.replace('[VOICE_NOTE]', '')} /></audio></div>
            ) : <>{displayText}{isLong && <button onClick={() => setIsExpanded(!isExpanded)} className="block mt-2 text-[10px] font-black text-yellow-500">{isExpanded ? 'LESS' : 'MORE'}</button>}</>}
          </div>

          {/* THE SIDEWAYS POP-OUT MENU */}
          {showMenu && (
            <div 
              ref={menuRef} 
              className={`absolute z-[1000] w-40 bg-[#1c212d] border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] py-1.5 animate-in fade-in zoom-in-95 duration-150 
                ${isSelf ? 'right-full mr-2 top-0' : 'left-full ml-2 top-0'}`}
            >
              <button onClick={() => { onReply(msg); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black text-slate-200 hover:bg-white/5 transition-colors uppercase tracking-widest"><Reply size={14} className="text-yellow-500/60" /> Reply</button>
              <button onClick={() => { navigator.clipboard.writeText(msg.text || ''); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black text-slate-200 hover:bg-white/5 transition-colors uppercase tracking-widest"><Copy size={14} className="text-yellow-500/60" /> Copy</button>
              {isSelf && <button onClick={() => { onDelete(msg.id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black text-red-500 hover:bg-red-500/10 border-t border-white/5 mt-1 pt-2 uppercase tracking-widest"><Trash2 size={14} /> Delete</button>}
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
