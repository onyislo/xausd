'use client';
import React from 'react';
import { Users, Shield, UserPlus, Link as LinkIcon, Check, UserMinus, Trash2, X } from 'lucide-react';

interface ModalsProps {
  isCreating: boolean;
  setIsCreating: (val: boolean) => void;
  newGroupName: string;
  setNewGroupName: (val: string) => void;
  handleCreate: () => void;
  isManaging: boolean;
  setIsManaging: (val: boolean) => void;
  activeChat: any;
  inviteEmail: string;
  setInviteEmail: (val: string) => void;
  handleAddMember: () => void;
  copyInviteLink: () => void;
  copied: boolean;
  members: any[];
  currentUser: any;
  handleRemoveMember: (id: string) => void;
  handleDeleteChannel: () => void;
}

export default function Modals({
  isCreating,
  setIsCreating,
  newGroupName,
  setNewGroupName,
  handleCreate,
  isManaging,
  setIsManaging,
  activeChat,
  inviteEmail,
  setInviteEmail,
  handleAddMember,
  copyInviteLink,
  copied,
  members,
  currentUser,
  handleRemoveMember,
  handleDeleteChannel
}: ModalsProps) {
  return (
    <>
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

      {/* Manage Channel Modal */}
      {isManaging && activeChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[450px] bg-[#0f1420] border border-yellow-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest">Manage Hub</h2>
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">{activeChat.name}</p>
              </div>
              <button onClick={() => setIsManaging(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block ml-1">Add Operative (by username)</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-[#0a0e17] text-slate-100 text-sm px-4 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-yellow-500/50"
                    placeholder="Enter operative username..."
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                  <button onClick={handleAddMember} className="px-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500 hover:bg-yellow-500/20 transition-all">
                    <UserPlus size={18} />
                  </button>
                </div>

                <button onClick={copyInviteLink} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/40 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all group">
                  {copied ? <Check size={14} className="text-green-500" /> : <LinkIcon size={14} className="group-hover:text-yellow-500" />}
                  {copied ? 'LINK COPIED TO CLIPBOARD' : 'GENERATE & COPY INVITE LINK'}
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-3 ml-1">Authorized Personnel ({members.length})</label>
                <div className="bg-[#0a0e17] rounded-xl border border-slate-800 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {members.map((m: any) => (
                    <div key={m.user_id} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {m.profiles?.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-300 font-bold">{m.profiles?.username}</span>
                      </div>
                      {m.user_id !== currentUser?.id && (
                        <button onClick={() => handleRemoveMember(m.user_id)} className="text-slate-600 hover:text-red-500 transition-colors" title="Revoke Access">
                          <UserMinus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-red-500/10">
                <button onClick={handleDeleteChannel} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest transition-all">
                  <Trash2 size={16} />
                  Decommission Hub (Permanent)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
