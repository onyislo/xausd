'use client';
import React from 'react';
import { Shield, Trash2 } from 'lucide-react';

interface MessageItemProps {
  msg: any;
  currentUserId: string;
  contactAvatar?: string;
  contactName?: string;
  onDelete: (id: string) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function MessageItem({ msg, currentUserId, contactAvatar, contactName, onDelete, onContextMenu }: MessageItemProps) {
  const isSelf = msg.user_id === currentUserId;
  const isSystem = msg.text?.startsWith('SYSTEM:');
  const [isExpanded, setIsExpanded] = React.useState(false);

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

  const isLong = msg.text?.length > 700;
  const displayText = isLong && !isExpanded ? msg.text.slice(0, 700) + '...' : msg.text;

    return (
      <div
        onContextMenu={(e) => isSelf && onContextMenu(e)}
        className={`w-full flex flex-col ${isSelf ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
      >
        <div className={`flex w-full ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5 px-2`}>
          {!isSelf && (
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mb-1 shadow-inner overflow-hidden">
              {contactAvatar ? (
                <img src={contactAvatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400">{contactName?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
          )}
          
          <div className={`relative group/bubble flex-1 flex ${isSelf ? 'justify-end' : 'justify-start'} min-w-0`}>
            <div className={`px-4 py-2.5 rounded-[20px] text-[13px] max-md:text-[12px] leading-relaxed font-medium transition-all break-words whitespace-pre-wrap shadow-sm w-fit max-w-[85%] md:max-w-[75%] lg:max-w-[65%] ${isSelf
              ? 'bg-[#241d0b] text-yellow-50/90 rounded-br-none border border-yellow-500/20'
              : 'bg-[#161b22] text-slate-200 rounded-bl-none border border-slate-700/30'
              }`}>
              {msg.text?.startsWith('[VOICE_NOTE]') ? (
                <div className="flex items-center gap-3 min-w-[180px] py-1">
                  <audio controls className="h-8 max-md:h-10 invert brightness-125 opacity-70 hover:opacity-100 transition-opacity">
                    <source src={msg.text.replace('[VOICE_NOTE]', '')} type="audio/webm" />
                  </audio>
                </div>
              ) : (
                <>
                  {displayText}
                  {isLong && (
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="block mt-2 text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </>
              )}
            </div>
                {isLong && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="block mt-2 text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400"
                  >
                    {isExpanded ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </>
            )}
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
