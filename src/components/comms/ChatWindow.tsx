'use client';
import React, { useRef, useEffect } from 'react';
import { Users, User, Phone, MoreVertical, Info, BellOff, Trash2, Shield, Link as LinkIcon, LogOut, Send, Mic, Square, X } from 'lucide-react';
import HeaderPrice from '@/components/HeaderPrice';
import MessageItem from './MessageItem';

interface ChatWindowProps {
  activeChat: any;
  activeId: string | null;
  setActiveId: (id: any) => void;
  currentUser: any;
  deleteMessage: (mid: string, activeId: string) => void;
  onRightClick: (e: React.MouseEvent, msgId: string) => void;
  startCall: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  setIsManaging: (val: boolean) => void;
  copyInviteLink: () => void;
  handleDeleteChannel: () => void;
  inputText: string;
  setInputText: (val: string) => void;
  handleSend: () => void;
  typingStatus: any[];
  setTyping: (channelId: string | null, isTyping: boolean) => void;
  sendVoiceNote: (blob: Blob) => void;
  sendFile: (file: File) => void;
  replyingTo: any;
  setReplyingTo: (msg: any) => void;
}

export default function ChatWindow({
  activeChat,
  activeId,
  setActiveId,
  currentUser,
  deleteMessage,
  onRightClick,
  startCall,
  isMenuOpen,
  setIsMenuOpen,
  setIsManaging,
  copyInviteLink,
  handleDeleteChannel,
  inputText,
  setInputText,
  handleSend,
  typingStatus,
  setTyping,
  sendVoiceNote,
  sendFile,
  replyingTo,
  setReplyingTo
}: ChatWindowProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordTime, setRecordTime] = React.useState(0);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (blob.size > 1000) {
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordTime(0);
      recordIntervalRef.current = setInterval(() => setRecordTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
  };

  const handleConfirmSend = () => {
    if (audioBlob) sendVoiceNote(audioBlob);
    setAudioUrl(null);
    setAudioBlob(null);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length]); // Only scroll when message count changes

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;

    // Instantly stop typing if the input is cleared
    if (e.target.value.trim() === '') {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      isTypingRef.current = false;
      setTyping(activeId, false);
      return;
    }

    // Immediate start, only broadcast if state changed
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setTyping(activeId, true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      setTyping(activeId, false);
    }, 500); // Reduced to 500ms for faster, snappy stop detection
  };

  const handleReply = (msg: any) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  return (
    <section className={`
      flex-1 bg-[#0f1420] border-0 md:border-yellow-500/20 
      rounded-none md:rounded-xl flex flex-col overflow-hidden shadow-2xl
      max-md:h-full max-md:min-h-0
      ${!activeChat ? 'hidden md:flex' : ''}
    `}>
      {!activeChat ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Users size={56} className="opacity-20 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">No Active Comms Detected</span>
          <span className="text-[9px] uppercase tracking-widest opacity-30">Select a channel to begin</span>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="relative h-[64px] border-b border-yellow-500/10 flex justify-between items-center px-6 shrink-0 bg-slate-800/40 max-md:h-auto max-md:min-h-[60px] max-md:px-2 max-md:gap-2 max-md:justify-start max-md:pt-[calc(10px+env(safe-area-inset-top))] max-md:pb-2 w-full max-w-full z-20">
            <div className="flex items-center gap-3 flex-1 min-w-0 max-md:gap-2">
              <button
                onClick={() => setActiveId(null)}
                className="flex md:hidden w-8 h-8 rounded-lg hover:bg-slate-700/50 items-center justify-center text-yellow-500 shrink-0"
                aria-label="Back"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="w-9 h-9 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/10 text-yellow-500 overflow-hidden shrink-0 max-md:w-8 max-md:h-8">
                {activeChat.avatar ? (
                  <img src={activeChat.avatar} className="w-full h-full object-cover" alt="" />
                ) : activeChat.type === 'dm' ? <User size={16} /> : <Users size={16} />}
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center overflow-hidden">
                <h2 className="text-[15px] font-bold text-slate-100 truncate max-md:text-[14px] leading-tight">{activeChat.name}</h2>
                <div key={activeChat.id} className="relative h-[14px] flex items-center overflow-hidden">
                  {activeChat.status.startsWith('last seen') ? (
                    <>
                      <span className="animate-whatsapp-collapse text-[11px] max-md:text-[10px] text-slate-400">last seen &nbsp;</span>
                      <span className="text-[11px] max-md:text-[10px] text-slate-400 whitespace-nowrap">
                        {activeChat.status.replace('last seen ', '')}
                      </span>
                    </>
                  ) : (
                    <span className={`text-[11px] max-md:text-[10px] leading-tight whitespace-nowrap ${activeChat.status === 'Online' ? 'text-green-400' : 'text-slate-400'}`}>
                      {activeChat.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 shrink-0 max-md:gap-2">
              <div className="md:hidden">
                <HeaderPrice compact />
              </div>

              {activeChat.type === 'dm' && (
                <button
                  onClick={startCall}
                  className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all active:scale-95 border border-green-500/10 max-md:w-9 max-md:h-9 max-md:p-0 max-md:flex max-md:items-center max-md:justify-center"
                  title="Call"
                >
                  <Phone size={16} />
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-1.5 rounded-lg transition-all ${isMenuOpen ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-slate-700/50'}`}
                >
                  <MoreVertical size={17} />
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-[#0f1420] border border-yellow-500/30 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {activeChat.type === 'dm' ? (
                      <>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                          <Info size={14} /> View Profile
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                          <BellOff size={14} /> Mute Chat
                        </button>
                        <div className="h-[1px] bg-red-500/10 my-1" />
                        <button onClick={() => { handleDeleteChannel(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-all font-bold">
                          <Trash2 size={14} /> Delete Chat
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setIsManaging(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                          <Info size={14} /> Group Info
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                          <BellOff size={14} /> Mute Group
                        </button>
                        <div className="h-[1px] bg-yellow-500/10 my-1" />
                        <button onClick={() => { copyInviteLink(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                          <LinkIcon size={14} /> Invite Link
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                          <LogOut size={14} /> Leave Group
                        </button>
                        {(activeChat.created_by === currentUser?.id || !activeChat.created_by) && (
                          <>
                            <div className="h-[1px] bg-red-500/10 my-1" />
                            <button onClick={() => { handleDeleteChannel(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-all font-bold">
                              <Trash2 size={14} /> Delete Group
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 flex flex-col gap-4 bg-[#0a0e17] custom-scrollbar max-md:p-3 max-md:gap-3 max-md:min-h-0 w-full max-w-full">
            {activeChat.messages?.map((msg: any, i: number) => (
              <MessageItem
                key={msg.id || i}
                msg={msg}
                currentUserId={currentUser?.id}
                contactAvatar={activeChat.avatar}
                contactName={activeChat.name}
                onDelete={(mid: string) => deleteMessage(mid, activeId as string)}
                onReply={handleReply}
                onContextMenu={(e: React.MouseEvent) => msg.id && msg.user_id === currentUser?.id && onRightClick(e, msg.id)}
              />
            ))}
            {/* Typing Indicator Bubble */}
            {typingStatus.length > 0 && (
              <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mb-1 overflow-hidden shadow-inner">
                  {typingStatus[0].avatarUrl ? (
                    <img src={typingStatus[0].avatarUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      {typingStatus[0].username?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="bg-[#161b22] px-4 py-3 rounded-[18px] rounded-bl-[4px] border border-slate-700/30 flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-yellow-500/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-yellow-500/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-yellow-500/60 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-[#0f1420] border-t border-slate-800 shrink-0 max-md:p-2 max-md:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="bg-[#0a0e17] border border-slate-700 rounded-xl flex flex-col p-2 focus-within:border-yellow-500/50 transition-all max-md:p-1.5 relative">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="mb-2 p-3 bg-yellow-500/5 border-l-4 border-yellow-500 rounded-lg flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-yellow-500 uppercase tracking-widest mb-0.5">
                      Replying to {replyingTo.user_id === currentUser?.id ? 'You' : activeChat.name}
                    </p>
                    <p className="text-[12px] text-slate-400 truncate">{replyingTo.text}</p>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Voice Review / Recording Bar */}
              {(isRecording || audioUrl) && (
                <div className="absolute inset-0 bg-[#0a0e17] rounded-xl z-10 flex items-center justify-between px-3 animate-in fade-in zoom-in duration-200">
                  {isRecording ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="text-[12px] font-bold text-slate-300 tabular-nums">
                          {Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setIsRecording(false); if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = null; mediaRecorderRef.current?.stop(); }} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                        <button onClick={stopRecording} className="bg-yellow-500 text-[#1a1200] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Stop</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setAudioUrl(null); setAudioBlob(null); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      <audio src={audioUrl!} controls className="h-8 invert brightness-125 opacity-80 flex-1 mx-2" />
                      <button onClick={handleConfirmSend} className="w-9 h-9 bg-yellow-500 text-[#1a1200] rounded-lg flex items-center justify-center shadow-lg"><Send size={18} className="rotate-45 -translate-y-0.5" /></button>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) sendFile(file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-800 rounded-lg transition-all shrink-0"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <textarea
                  ref={inputRef}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none px-3 resize-none custom-scrollbar py-2 max-h-32"
                  placeholder="Send encrypted message..."
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                      isTypingRef.current = false;
                      setTyping(activeId, false);
                      e.currentTarget.style.height = 'auto';
                    }
                  }}
                />
                <div className="flex items-center gap-1">
                  {!inputText.trim() ? (
                    <button
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 ${isRecording ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-800'}`}
                      onMouseDown={(e) => {
                        if (window.innerWidth > 768) {
                          isRecording ? stopRecording() : startRecording();
                        }
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        if (window.innerWidth <= 768) startRecording();
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        if (window.innerWidth <= 768) stopRecording();
                      }}
                      title="Hold to record (Mobile) / Click to toggle (Desktop)"
                    >
                      <Mic size={18} />
                    </button>
                  ) : (
                    <button
                      className="w-9 h-9 bg-yellow-500 hover:bg-yellow-400 text-[#1a1200] rounded-lg flex items-center justify-center transition-all active:scale-95 shrink-0"
                      onMouseDown={e => { 
                        e.preventDefault(); 
                        handleSend(); 
                        isTypingRef.current = false;
                        setTyping(activeId, false);
                      }}
                      onClick={e => e.preventDefault()}
                    >
                      <Send size={18} className="rotate-45 -translate-y-0.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
