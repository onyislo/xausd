'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User } from 'lucide-react';

const TABS = ['Gold Market Analysis', 'Geopolitical Intel', 'Technical Analysis', 'Risk Management'];

const MOCK_MESSAGES: Record<string, { role: 'user' | 'ai'; text: string; time: string }[]> = {
  'Gold Market Analysis': [
    { role: 'user', text: 'What are your thoughts on gold right now?', time: '14:52 PM' },
    { role: 'ai', text: 'XAU/USD is showing bullish momentum. NFP data at +254K signals strong employment, historically correlating with short-term gold pullbacks but medium-term safe-haven accumulation.', time: '14:52 PM' },
    { role: 'user', text: 'Should I buy dips?', time: '14:55 PM' },
    { role: 'ai', text: 'Key support at $2,310. Watch the DXY reaction — if dollar weakens, buy the $2,315 level. Target $2,380 in the next 48 hours.', time: '14:55 PM' },
  ],
  'Geopolitical Intel': [
    { role: 'ai', text: 'Naval confrontation in South China Sea classified as HIGH threat. Safe-haven demand for gold expected to spike. Monitor PBOC response.', time: '14:38 PM' },
    { role: 'user', text: 'How does this affect XAU?', time: '14:40 PM' },
    { role: 'ai', text: 'Historically, South China Sea tensions push gold +1.2–2.8% within 24h. Current institutional positioning suggests accumulation mode.', time: '14:40 PM' },
  ],
  'Technical Analysis': [
    { role: 'user', text: 'What are the key levels?', time: '14:30 PM' },
    { role: 'ai', text: 'Resistance: $2,360 / $2,390 / $2,420. Support: $2,310 / $2,285 / $2,250. RSI at 58 — room to run. MACD bullish crossover on 4H.', time: '14:31 PM' },
  ],
  'Risk Management': [
    { role: 'ai', text: 'Current portfolio risk exposure: MEDIUM. Suggest max 2% account risk per trade on XAU/USD given elevated geopolitical volatility.', time: '14:20 PM' },
    { role: 'user', text: 'What position size for $10k account?', time: '14:22 PM' },
    { role: 'ai', text: 'At $10k with 2% risk and 30-pip SL: ~0.67 lots. Ensure SL is below $2,308 structure low. R:R minimum 1:2.', time: '14:22 PM' },
  ],
};

export default function LiveChat() {
  const [activeTab, setActiveTab] = useState('Gold Market Analysis');
  const [input, setInput] = useState('');
  const [allMessages, setAllMessages] = useState(MOCK_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = React.useMemo(() => allMessages[activeTab] ?? [], [allMessages, activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAllMessages(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] ?? []), { role: 'user', text, time }],
    }));
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const aiReplies: Record<string, string> = {
        'Gold Market Analysis': 'Based on current macro data, gold sentiment remains bullish. Watch the Fed minutes for volatility triggers.',
        'Geopolitical Intel': 'New geopolitical data ingested. Threat level remains elevated — safe-haven flows continuing.',
        'Technical Analysis': 'Pattern analysis updated. Ascending channel intact. Next key test at $2,360 resistance.',
        'Risk Management': 'Risk parameters recalculated. Current market volatility suggests tightening stops by 10–15%.',
      };
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAllMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] ?? []), { role: 'ai', text: aiReplies[activeTab] ?? 'Processing…', time: replyTime }],
      }));
      setIsTyping(false);
    }, 1400);
  };

  return (
    <div className="panel flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800/40 px-4 py-2 border-b border-slate-700/50 flex justify-between items-center shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_#f5c451]" />
          <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] font-mono">Live Intelligence</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer transition-colors" />
          <div className="w-2 h-2 rounded-full bg-red-500/50 hover:bg-red-500 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-3 py-2 border-b border-slate-800/80 overflow-x-auto shrink-0 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 border ${activeTab === tab
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(245,196,81,0.1)]'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/50 hover:text-slate-300 hover:bg-slate-800/60'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 px-3 py-2 overflow-y-auto flex flex-col gap-2.5 min-h-0">
        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User size={10} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-slate-300 text-[10px] font-bold">You</span>
                  <span className="text-slate-600 text-[9px]">{msg.time}</span>
                </div>
                <div className="bg-slate-800 text-slate-200 text-[11px] p-2 rounded-lg rounded-tl-none leading-relaxed">
                  {msg.text}
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-2 items-start flex-row-reverse">
              <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 border border-yellow-500/40 mt-0.5">
                <Bot size={10} className="text-yellow-400" />
              </div>
              <div className="flex-1 flex flex-col items-end min-w-0">
                <div className="flex justify-between items-baseline mb-0.5 w-full flex-row-reverse">
                  <span className="text-yellow-400 text-[10px] font-bold">AI Expert</span>
                  <span className="text-slate-600 text-[9px]">{msg.time}</span>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-slate-200 text-[11px] p-2 rounded-lg rounded-tr-none leading-relaxed">
                  {msg.text}
                </div>
              </div>
            </div>
          )
        )}

        {isTyping && (
          <div className="flex gap-2 items-center ml-7">
            <div className="flex gap-0.5">
              {[0, 0.15, 0.3].map((d, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-yellow-500/60 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
            <span className="text-[9px] text-slate-500">AI is typing…</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-900/60 backdrop-blur-md shrink-0">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Interrogate AI Core…"
            className="w-full bg-[#0a0e17] border border-slate-700 rounded-xl py-2 pl-4 pr-12 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
          />
          <button
            onClick={handleSend}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-yellow-500 hover:bg-yellow-400 text-[#1a1200] rounded-lg transition-all flex items-center justify-center active:scale-95 shadow-[0_0_10px_rgba(245,196,81,0.2)]"
          >
            <Send size={12} className="stroke-[2.5px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
