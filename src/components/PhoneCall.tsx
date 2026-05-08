'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PhoneOff, Mic, MicOff, Phone } from 'lucide-react';

interface PhoneCallProps {
  roomId: string; isIncoming: boolean; targetName: string; targetId: string;
  currentUserId: string; onEndCall: () => void;
}

const ICE = { iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] };

export default function PhoneCall({ roomId, isIncoming, targetName, targetId, currentUserId, onEndCall }: PhoneCallProps) {
  const [status, setStatus] = useState<'ringing' | 'connected'>('ringing');
  const [muted, setMuted] = useState(false);
  const [secs, setSecs] = useState(0);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const ch = useRef<any>(null);
  const logId = useRef<string | null>(null);
  const t0 = useRef(Date.now());
  const timerRef = useRef<any>(null);
  const iceBuf = useRef<RTCIceCandidate[]>([]); // buffer early ICE candidates

  // Start timer when connected
  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  useEffect(() => {
    let live = true;
    t0.current = Date.now();

    // Log call
    const caller = isIncoming ? targetId : currentUserId;
    const callee = isIncoming ? currentUserId : targetId;
    if (caller && callee) supabase.from('call_logs')
      .insert([{ room_id: roomId, caller_id: caller, callee_id: callee, status: 'missed' }])
      .select().single().then(({ data }) => { if (data) logId.current = data.id; });

    const init = async () => {
      try { localStream.current = await navigator.mediaDevices.getUserMedia({ video: false, audio: true }); } catch {}
      pc.current = new RTCPeerConnection(ICE);
      localStream.current?.getTracks().forEach(t => pc.current?.addTrack(t, localStream.current!));
      ch.current = supabase.channel(`webrtc:${roomId}`);

      pc.current.onicecandidate = (e) => {
        if (e.candidate) ch.current.send({ type: 'broadcast', event: 'ice', payload: { candidate: e.candidate, from: currentUserId } });
      };

      // RECEIVER: receives offer → sends answer → sets connected
      ch.current.on('broadcast', { event: 'offer' }, async ({ payload }: any) => {
        if (payload.from === currentUserId || !pc.current) return;
        await pc.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
        // flush buffered ICE candidates
        for (const c of iceBuf.current) await pc.current.addIceCandidate(c);
        iceBuf.current = [];
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        ch.current.send({ type: 'broadcast', event: 'answer', payload: { answer, from: currentUserId } });
        if (live) setStatus('connected');
      });

      // CALLER: receives answer → sets connected
      ch.current.on('broadcast', { event: 'answer' }, async ({ payload }: any) => {
        if (payload.from === currentUserId || !pc.current) return;
        await pc.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        // flush buffered ICE candidates
        for (const c of iceBuf.current) await pc.current.addIceCandidate(c);
        iceBuf.current = [];
        if (live) setStatus('connected');
      });

      ch.current.on('broadcast', { event: 'ice' }, async ({ payload }: any) => {
        if (payload.from === currentUserId || !pc.current) return;
        const candidate = new RTCIceCandidate(payload.candidate);
        // buffer if remote description not set yet
        if (!pc.current.remoteDescription) { iceBuf.current.push(candidate); return; }
        await pc.current.addIceCandidate(candidate);
      });

      ch.current.on('broadcast', { event: 'end' }, () => end());

      await ch.current.subscribe(async (s: string) => {
        if (s === 'SUBSCRIBED' && !isIncoming && pc.current && live) {
          const offer = await pc.current.createOffer();
          await pc.current.setLocalDescription(offer);
          ch.current.send({ type: 'broadcast', event: 'offer', payload: { offer, from: currentUserId } });
        }
      });
    };

    init();
    return () => { live = false; pc.current?.close(); localStream.current?.getTracks().forEach(t => t.stop()); if (ch.current) supabase.removeChannel(ch.current); };
  }, []);

  const end = (broadcast = false) => {
    clearInterval(timerRef.current);
    if (broadcast && ch.current) ch.current.send({ type: 'broadcast', event: 'end', payload: {} });
    if (logId.current) supabase.from('call_logs').update({ status: status === 'connected' ? 'answered' : 'missed', duration_sec: secs }).eq('id', logId.current).then();
    pc.current?.close();
    localStream.current?.getTracks().forEach(t => t.stop());
    if (ch.current) supabase.removeChannel(ch.current);
    onEndCall();
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center gap-7 bg-[#0f1420] border border-white/8 rounded-3xl p-10 w-[320px] shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
        {/* accent line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl bg-gradient-to-r from-transparent ${status === 'connected' ? 'via-green-400/60' : 'via-yellow-500/60'} to-transparent transition-colors duration-700`} />

        {/* Avatar */}
        <div className="relative mt-2">
          {status === 'ringing' && <span className="absolute -inset-3 rounded-full bg-yellow-500/15 animate-ping" />}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black border-2 transition-all duration-700 ${status === 'connected' ? 'bg-green-500/15 border-green-400/50 text-green-300 shadow-[0_0_30px_rgba(74,222,128,0.2)]' : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'}`}>
            {targetName[0]?.toUpperCase()}
          </div>
        </div>

        {/* Name + status/timer */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-[17px] font-black text-white tracking-widest uppercase">{targetName}</h2>
          {status === 'connected' ? (
            <span className="text-[22px] font-mono font-bold text-green-400 tracking-widest tabular-nums">{fmt(secs)}</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <Phone size={11} className="text-yellow-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 animate-pulse">Ringing...</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5 mt-1">
          <button onClick={() => { localStream.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; }); setMuted(m => !m); }}
            className={`p-4 rounded-full border transition-all ${muted ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button onClick={() => end(true)}
            className="p-5 rounded-full bg-red-500 hover:bg-red-400 text-white shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all">
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
