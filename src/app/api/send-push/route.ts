import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Configure Web Push safely (prevents Vercel build crash if env vars are missing)
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webPush.setVapidDetails(
      'mailto:admin@auscope.com', 
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.error("VAPID setup failed:", err);
  }
} else {
  console.warn('VAPID keys are missing. Push notifications will not work.');
}

// Initialize Supabase Admin client to fetch subscriptions and profiles
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Check Authorization if needed, or rely on a secret header if called from DB Trigger
    const { channel_id, content, sender_id } = await req.json();

    if (!channel_id || !content || !sender_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get the sender's profile for the notification title and avatar
    const { data: sender } = await supabaseAdmin
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', sender_id)
      .single();

    const senderName = sender?.username || sender?.full_name || 'Someone';
    
    // Create a dynamic icon: use their avatar if they have one, otherwise generate initials
    let senderIcon = sender?.avatar_url;
    if (!senderIcon) {
      senderIcon = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=0f1420&color=f5c451&rounded=true&size=192&bold=true`;
    }

    // 2. Get the other members of the channel
    const { data: members } = await supabaseAdmin
      .from('channel_members')
      .select('user_id')
      .eq('channel_id', channel_id)
      .neq('user_id', sender_id);

    if (!members || members.length === 0) {
      return NextResponse.json({ success: true, message: 'No other members to notify' });
    }

    const memberIds = members.map(m => m.user_id);

    // 3. Get the push subscriptions for those members
    const { data: subscriptions } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription, user_id')
      .in('user_id', memberIds);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscriptions found' });
    }

    // 4. Send the push notifications
    const payload = JSON.stringify({
      title: `${senderName}`,
      body: content.startsWith('[VOICE_NOTE]') ? '🎤 Voice Recording' : content,
      url: `/comms`,
      tag: `auscope-chat-${channel_id}`,
      icon: senderIcon,
    });

    const sendPromises = subscriptions.map(async (subRecord) => {
      try {
        await webPush.sendNotification(subRecord.subscription as any, payload);
      } catch (err: any) {
        // If the subscription is invalid or expired, remove it from the database
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log('Subscription expired, removing from DB', subRecord.user_id);
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('user_id', subRecord.user_id)
            .eq('subscription->>endpoint', (subRecord.subscription as any).endpoint);
        } else {
          console.error('Error sending push:', err);
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error: any) {
    console.error('Push Notification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
