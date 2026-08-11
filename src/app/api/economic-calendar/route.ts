import { NextResponse } from 'next/server';

export interface CalendarEvent {
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

interface FFRaw {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

const TRACKED = new Set(['USD', 'JPY', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'NZD']);

function mapImpact(raw: string): CalendarEvent['impact'] {
  const s = raw.toLowerCase();
  if (s === 'high')   return 'HIGH';
  if (s === 'medium') return 'MEDIUM';
  if (s === 'low')    return 'LOW';
  return 'HOLIDAY';
}

function fmtTime(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York',
    });
  } catch { return 'TBD'; }
}

export async function GET() {
  try {
    const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Source returned ${res.status}`, events: [], upcoming: [], todayHigh: [] },
        { status: 502 }
      );
    }

    const raw: FFRaw[] = await res.json();
    const now = Date.now();

    const events: CalendarEvent[] = raw
      .filter(e => TRACKED.has(e.country))
      .map((e, i) => {
        const eventDate = new Date(e.date);
        return {
          id:          `ff-${i}-${e.country}-${eventDate.getTime()}`,
          date:         eventDate.toISOString(),
          time:         fmtTime(e.date),
          currency:     e.country,
          impact:       mapImpact(e.impact),
          title:        e.title.trim(),
          forecast:     e.forecast  ?? '',
          previous:     e.previous  ?? '',
          actual:       e.actual    ?? '',
          minutesUntil: Math.round((eventDate.getTime() - now) / 60000),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcoming  = events.filter(e => e.minutesUntil >= -60  && e.minutesUntil <= 1440 && e.impact === 'HIGH');
    const todayHigh = events.filter(e => e.minutesUntil >= -480 && e.minutesUntil <= 1440 && e.impact === 'HIGH');

    return NextResponse.json({
      success: true,
      events,
      upcoming,
      todayHigh,
      count:     events.length,
      source:    'forexfactory',
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, events: [], upcoming: [], todayHigh: [] },
      { status: 500 }
    );
  }
}
