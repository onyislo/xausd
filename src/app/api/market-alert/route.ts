import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Configure VAPID
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webPush.setVapidDetails(
      'mailto:admin@auscope.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (e) {
    console.error('VAPID setup error:', e);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface MarketAlertPayload {
  title: string;       // e.g. "🔴 HIGH IMPACT: US NFP"
  body: string;        // e.g. "Non-Farm Payrolls in 15 minutes — Forecast: 180K"
  currency: string;    // "USD", "JPY", etc.
  impact: string;      // "HIGH" | "MEDIUM"
  minutesUntil: number;
  url?: string;
}

export async function POST(req: Request) {
  try {
    const alert: MarketAlertPayload = await req.json();

    // Fetch all push subscriptions
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('subscription, user_id');

    if (error || !subs?.length) {
      return NextResponse.json({ success: true, message: 'No subscriptions', sent: 0 });
    }

    const impactEmoji = alert.impact === 'HIGH' ? '🔴' : '🟡';
    const timeLabel = alert.minutesUntil <= 0
      ? 'Released now'
      : alert.minutesUntil < 60
      ? `In ${alert.minutesUntil} minutes`
      : `In ${Math.round(alert.minutesUntil / 60)}h`;

    const payload = JSON.stringify({
      title: `${impactEmoji} ${alert.impact} IMPACT: ${alert.currency}`,
      body: `${alert.title} — ${timeLabel}\n${alert.body || ''}`.trim(),
      icon: '/icon-192.png',
      badge: '/badge-96.png',
      tag: `market-alert-${alert.currency}-${Date.now()}`,
      url: alert.url || '/news',
      vibrate: [300, 100, 300, 100, 600],
    });

    let sent = 0;
    const stale: string[] = [];

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webPush.sendNotification(sub.subscription as any, payload);
          sent++;
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            stale.push(sub.user_id);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (stale.length > 0) {
      await supabase.from('push_subscriptions').delete().in('user_id', stale);
    }

    return NextResponse.json({ success: true, sent, stale: stale.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
