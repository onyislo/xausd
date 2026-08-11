'use client';
import React from 'react';
import { Trash2, Copy } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  msgId: string;
  onDelete: (id: string) => void;
}

export default function ContextMenu({ x, y, msgId, onDelete }: ContextMenuProps) {
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
        onClick={() => {
            // Optional: Implement copy logic if needed, but for now just a UI placeholder
        }}
      >
        <Copy size={13} /> Copy Text
      </button>
    </div>
  );
}
