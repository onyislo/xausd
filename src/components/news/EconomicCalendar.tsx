'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, BellOff, RefreshCw, AlertTriangle, CalendarDays, Zap, ChevronDown, CheckCircle2 } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW' | 'HOLIDAY';
  title: string;
  forecast: string;
  previous: string;
  actual: string;
  minutesUntil: number;
}

// ── Hardcoded colour maps — no Tailwind opacity tricks ────────────────────────
const IMPACT_BAR: Record<string, string> = {
  HIGH:    '#ef4444',
  MEDIUM:  '#f59e0b',
  LOW:     '#475569',
  HOLIDAY: '#334155',
};

const IMPACT_BADGE: Record<string, React.CSSProperties> = {
  HIGH:    { background: 'rgba(239,68,68,0.2)',   border: '1px solid rgba(239,68,68,0.6)',   color: '#fca5a5' },
  MEDIUM:  { background: 'rgba(245,158,11,0.2)',  border: '1px solid rgba(245,158,11,0.6)',  color: '#fcd34d' },
  LOW:     { background: 'rgba(71,85,105,0.3)',   border: '1px solid rgba(100,116,139,0.5)', color: '#94a3b8' },
  HOLIDAY: { background: 'rgba(51,65,85,0.3)',    border: '1px solid rgba(71,85,105,0.4)',   color: '#64748b' },
};

const CUR_BADGE: Record<string, React.CSSProperties> = {
  USD: { background: 'rgba(16,185,129,0.2)',  border: '1px solid rgba(52,211,153,0.5)',  color: '#6ee7b7' },
  JPY: { background: 'rgba(14,165,233,0.2)',  border: '1px solid rgba(56,189,248,0.5)',  color: '#7dd3fc' },
  EUR: { background: 'rgba(59,130,246,0.2)',  border: '1px solid rgba(96,165,250,0.5)',  color: '#93c5fd' },
  GBP: { background: 'rgba(139,92,246,0.2)',  border: '1px solid rgba(167,139,250,0.5)', color: '#c4b5fd' },
  AUD: { background: 'rgba(234,179,8,0.2)',   border: '1px solid rgba(250,204,21,0.5)',  color: '#fde047' },
  CAD: { background: 'rgba(236,72,153,0.2)',  border: '1px solid rgba(244,114,182,0.5)', color: '#f9a8d4' },
  CHF: { background: 'rgba(239,68,68,0.15)',  border: '1px solid rgba(248,113,113,0.5)', color: '#fca5a5' },
  NZD: { background: 'rgba(20,184,166,0.2)',  border: '1px solid rgba(45,212,191,0.5)',  color: '#5eead4' },
};

const defaultCurBadge: React.CSSProperties = {
  background: 'rgba(71,85,105,0.3)', border: '1px solid rgba(100,116,139,0.5)', color: '#94a3b8',
};

function cdown(mins: number): { label: string; urgent: boolean } {
  if (mins < -30)  return { label: 'Released', urgent: false };
  if (mins < 0)    return { label: '🔴 LIVE',   urgent: true  };
  if (mins === 0)  return { label: '🔴 NOW',    urgent: true  };
  if (mins <= 15)  return { label: `${mins}m`,  urgent: true  };
  if (mins < 60)   return { label: `${mins}m`,  urgent: false };
  const h = Math.floor(mins / 60), m = mins % 60;
  return { label: m ? `${h}h ${m}m` : `${h}h`, urgent: false };
}

function groupByDay(evts: CalendarEvent[]): [string, CalendarEvent[]][] {
  const map: Record<string, CalendarEvent[]> = {};
  evts.forEach(e => {
    const k = new Date(e.date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
    (map[k] ??= []).push(e);
  });
  return Object.entries(map);
}

async function getPushSub(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  const ex  = await reg.pushManager.getSubscription();
  if (ex) return ex;
  const key   = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const bytes = Uint8Array.from(atob(key.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });
}

// ── component ─────────────────────────────────────────────────────────────────
export default function EconomicCalendar() {
  const [events, setEvents]             = useState<CalendarEvent[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error,   setError]             = useState<string | null>(null);
  const [notifOk, setNotifOk]           = useState(false);
  const [notifOn, setNotifOn]           = useState(false);
  const [filter,  setFilter]            = useState<'ALL'|'HIGH'|'USD'|'JPY'|'OIL'>('ALL');
  const [updated, setUpdated]           = useState<Date | null>(null);
  const [sent,    setSent]              = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed]       = useState<Set<string>>(new Set());
  const alertTimer = useRef<ReturnType<typeof setInterval>|null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/economic-calendar');
      const data = await res.json();
      if (data.success && data.events?.length) {
        setEvents(data.events);
        setUpdated(new Date());
      } else {
        setError(data.error ?? 'No events returned');
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  // ── notification permission ─────────────────────────────────────────────────
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') { setNotifOk(true); setNotifOn(true); }
  }, []);

  // ── alert scheduler ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!notifOn) return;
    const check = async () => {
      const due = events.filter(e =>
        e.impact === 'HIGH' && e.minutesUntil > 0 && e.minutesUntil <= 30 &&
        !sent.has(`${e.id}-${Math.floor(e.minutesUntil / 5)}`)
      );
      for (const ev of due) {
        const key = `${ev.id}-${Math.floor(ev.minutesUntil / 5)}`;
        if (sent.has(key)) continue;
        try {
          await fetch('/api/market-alert', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: ev.title, currency: ev.currency, impact: ev.impact,
              minutesUntil: ev.minutesUntil,
              body: [ev.forecast && `Forecast: ${ev.forecast}`, ev.previous && `Prev: ${ev.previous}`].filter(Boolean).join(' · '),
              url: '/news',
            }),
          });
          setSent(p => new Set([...Array.from(p), key]));
        } catch {}
      }
    };
    alertTimer.current = setInterval(check, 60000);
    check();
    return () => { if (alertTimer.current) clearInterval(alertTimer.current); };
  }, [notifOn, events, sent]);

  const enableAlerts = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotifOk(true); setNotifOn(true);
      try {
        const sub = await getPushSub();
        if (sub) await fetch('/api/push-subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub }) }).catch(() => {});
      } catch {}
    }
  };

  // ── filter ──────────────────────────────────────────────────────────────────
  const visible = events.filter(e =>
    filter === 'HIGH' ? e.impact === 'HIGH' :
    filter === 'USD'  ? e.currency === 'USD' :
    filter === 'JPY'  ? e.currency === 'JPY' :
    filter === 'OIL'  ? e.currency === 'OIL' :
    true
  );

  const days       = groupByDay(visible);
  const todayKey   = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const highToday  = events.filter(e => e.impact === 'HIGH' && e.minutesUntil >= -480 && e.minutesUntil <= 1440).length;
  const nextHigh   = events.find(e => e.impact === 'HIGH' && e.minutesUntil > 0);

  // ── styles (all panels have explicit bg so nothing bleeds through) ──────────
  const panelBg: React.CSSProperties  = { background: '#111827', color: '#f1f5f9' };
  const headerBg: React.CSSProperties = { background: '#1a2235', borderBottom: '1px solid rgba(255,255,255,0.08)' };
  const dayHdrBg  = (today: boolean): React.CSSProperties => ({
    background: today ? 'rgba(245,196,81,0.08)' : '#161f30',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  });
  const rowBg = (isLive: boolean): React.CSSProperties => ({
    background: isLive ? 'rgba(239,68,68,0.07)' : 'transparent',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  });

  return (
    <div style={{ ...panelBg, display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div style={{ ...headerBg, padding: '12px 16px', flexShrink: 0 }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,196,81,0.15)', border: '1px solid rgba(245,196,81,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarDays size={13} color="#f5c451" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 900, color: '#f1f5f9', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1, fontFamily: "'Chakra Petch', sans-serif", margin: 0 }}>
                Economic Calendar
              </p>
              <p style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '3px 0 0 0' }}>
                Forex Factory · Live
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Next HIGH countdown pill */}
            {nextHigh && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: 9, fontWeight: 900, color: '#fca5a5', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {cdown(nextHigh.minutesUntil).label}
                </span>
              </div>
            )}

            {/* Alert button */}
            <button
              onClick={notifOk ? () => setNotifOn(v => !v) : enableAlerts}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                borderRadius: 6, fontSize: 8, fontWeight: 900, letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
                background: notifOn ? 'rgba(16,185,129,0.2)'  : 'rgba(71,85,105,0.4)',
                border:     notifOn ? '1px solid rgba(52,211,153,0.6)' : '1px solid rgba(100,116,139,0.5)',
                color:      notifOn ? '#6ee7b7' : '#94a3b8',
              }}>
              {notifOn ? <Bell size={10} /> : <BellOff size={10} />}
              {notifOn ? 'Alerts ON' : 'Alerts'}
            </button>

            <button onClick={load} disabled={loading} style={{ padding: 6, borderRadius: 6, background: 'rgba(71,85,105,0.4)', border: '1px solid rgba(100,116,139,0.4)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: loading ? 0.4 : 1 }}>
              <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {highToday > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <AlertTriangle size={8} color="#fca5a5" />
              <span style={{ fontSize: 8, color: '#fca5a5', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{highToday} HIGH TODAY</span>
            </div>
          )}
          {updated && (
            <span style={{ fontSize: 8, color: '#64748b', fontFamily: 'monospace' }}>
              {updated.toLocaleTimeString()}
            </span>
          )}
          {notifOn && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={8} color="#34d399" />
              <span style={{ fontSize: 7, color: '#34d399', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>30m · 15m · 5m</span>
            </div>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['ALL','HIGH','USD','JPY','OIL'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 8, fontWeight: 900,
              letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
              background: filter === f ? 'rgba(245,196,81,0.2)'  : 'rgba(30,41,59,0.8)',
              border:     filter === f ? '1px solid rgba(245,196,81,0.5)' : '1px solid rgba(71,85,105,0.5)',
              color:      filter === f ? '#fde68a' : '#94a3b8',
            }}>
              {f === 'HIGH' ? '● HIGH' : f}
            </button>
          ))}
        </div>
      </div>

      {/* ══ EVENT LIST ══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">

        {/* Loading */}
        {loading && events.length === 0 && (
          <div style={{ padding: 16 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '10px 12px', marginBottom: 4, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 3, borderRadius: 2, background: '#1e293b', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8,  width: 48,  background: '#1e293b', borderRadius: 2, marginBottom: 6 }} />
                  <div style={{ height: 12, width: '75%', background: '#1e293b', borderRadius: 2, marginBottom: 4 }} />
                  <div style={{ height: 8,  width: 80,  background: '#1e293b', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <AlertTriangle size={24} color="#ef4444" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>Could not load calendar</p>
            <p style={{ fontSize: 9, color: '#64748b', marginBottom: 12 }}>{error}</p>
            <button onClick={load} style={{ padding: '6px 16px', borderRadius: 6, background: 'rgba(245,196,81,0.15)', border: '1px solid rgba(245,196,81,0.4)', color: '#fde68a', fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Retry
            </button>
          </div>
        )}

        {/* Days */}
        {!error && days.map(([dayLabel, dayEvts]) => {
          const isToday    = dayLabel === todayKey;
          const isCollapsed = collapsed.has(dayLabel);
          const highCount  = dayEvts.filter(e => e.impact === 'HIGH').length;

          return (
            <div key={dayLabel}>
              {/* Day header button */}
              <button
                onClick={() => setCollapsed(p => { const s = new Set(p); s.has(dayLabel) ? s.delete(dayLabel) : s.add(dayLabel); return s; })}
                style={{ ...dayHdrBg(isToday), width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 16px', cursor: 'pointer', border: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isToday && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f5c451' }} />}
                  <span style={{ fontSize: 10, fontWeight: 900, color: isToday ? '#fde68a' : '#e2e8f0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {isToday ? `Today · ${dayLabel}` : dayLabel}
                  </span>
                  {highCount > 0 && (
                    <span style={{ fontSize: 8, color: '#fca5a5', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {highCount} HIGH
                    </span>
                  )}
                </div>
                <ChevronDown size={11} color="#64748b" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {/* Events */}
              {!isCollapsed && dayEvts.map(ev => {
                const isPast  = ev.minutesUntil < -30;
                const isLive  = ev.minutesUntil >= -30 && ev.minutesUntil <= 5;
                const cd      = cdown(ev.minutesUntil);
                const curBadge = CUR_BADGE[ev.currency] ?? defaultCurBadge;
                const impBadge = IMPACT_BADGE[ev.impact] ?? IMPACT_BADGE.LOW;
                const barColor = IMPACT_BAR[ev.impact] ?? '#475569';

                return (
                  <div key={ev.id} style={{ ...rowBg(isLive), display: 'flex', opacity: isPast ? 0.35 : 1 }}>
                    {/* Impact bar */}
                    <div style={{ width: 3, flexShrink: 0, background: isPast ? '#1e293b' : barColor }} />

                    <div style={{ flex: 1, padding: '10px 12px 10px 10px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>

                          {/* Badges */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
                            <span style={{ ...curBadge, padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                              {ev.currency}
                            </span>
                            <span style={{ ...impBadge, padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                              {ev.impact}
                            </span>
                            {isLive && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, fontWeight: 900, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                <Zap size={7} color="#ef4444" />LIVE
                              </span>
                            )}
                          </div>

                          {/* ── EVENT TITLE — white, always visible ── */}
                          <p style={{
                            margin: '0 0 6px 0',
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1.35,
                            color: isPast ? '#475569' : '#f1f5f9',
                            fontFamily: "'Chakra Petch', sans-serif",
                          }}>
                            {ev.title}
                          </p>

                          {/* Forecast / Actual / Previous */}
                          {(ev.forecast || ev.previous || ev.actual) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              {ev.actual && (
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#6ee7b7' }}>
                                  ACT <span style={{ fontFamily: 'monospace' }}>{ev.actual}</span>
                                </span>
                              )}
                              {ev.forecast && (
                                <span style={{ fontSize: 9, fontWeight: 600, color: '#cbd5e1' }}>
                                  FCST <span style={{ fontFamily: 'monospace' }}>{ev.forecast}</span>
                                </span>
                              )}
                              {ev.previous && (
                                <span style={{ fontSize: 9, color: '#94a3b8' }}>
                                  PREV <span style={{ fontFamily: 'monospace' }}>{ev.previous}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Time + countdown */}
                        <div style={{ flexShrink: 0, textAlign: 'right', paddingTop: 2 }}>
                          <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 3 }}>
                            {ev.time}
                          </div>
                          {!isPast && (
                            <div style={{ fontSize: 10, fontWeight: 900, color: cd.urgent ? '#fca5a5' : '#cbd5e1' }}>
                              {cd.label}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Empty */}
        {!loading && !error && visible.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <CalendarDays size={24} color="#334155" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No events</p>
          </div>
        )}
      </div>
    </div>
  );
}
