'use client';
import React from 'react';
import { User, Users } from 'lucide-react';

interface ChatListItemProps {
  chat: any;
  active: boolean;
  onSelect: () => void;
}

export default function ChatListItem({ chat, active, onSelect }: ChatListItemProps) {
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
        {chat.avatar ? (
          <img src={chat.avatar} className="w-full h-full object-cover" alt="" />
        ) : chat.type === 'dm' ? (
          <User size={18} className={active ? 'text-yellow-500' : 'text-slate-500'} />
        ) : (
          <Users size={18} className={active ? 'text-yellow-500' : 'text-slate-500'} />
        )}
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
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter shrink-0 ml-2 flex items-center gap-2">
            {chat.unreadCount > 0 && (
              <span className="bg-yellow-500 text-[#1a1200] px-1.5 py-0.5 rounded-md text-[8px] font-black animate-in zoom-in duration-300 shadow-[0_0_10px_rgba(245,196,81,0.4)]">
                {chat.unreadCount}
              </span>
            )}
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
