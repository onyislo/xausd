import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

const emailHtml = (email: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AuScope — You're on the Waitlist</title>
</head>
<body style="margin:0;padding:0;background:#0a0e17;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e17;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#0f1520;border-radius:16px;border:1px solid rgba(245,196,81,0.12);overflow:hidden;">
        
        <!-- Gold top accent -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#b8860b,#f5c451,#b8860b);"></td></tr>
        
        <!-- Header -->
        <tr><td style="padding:48px 40px 32px;text-align:center;background:linear-gradient(180deg,rgba(245,196,81,0.04) 0%,transparent 100%);">
          <div style="display:inline-block;width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#f5c451,#b8860b);margin-bottom:20px;line-height:56px;text-align:center;">
            <span style="font-size:24px;line-height:56px;display:inline-block;">▦</span>
          </div>
          <div style="font-size:13px;letter-spacing:0.22em;color:#f5c451;text-transform:uppercase;font-weight:800;margin-bottom:6px;">AuScope</div>
          <div style="font-size:10px;letter-spacing:0.16em;color:#4a5568;text-transform:uppercase;">XAU/USD Intelligence Terminal</div>
        </td></tr>
        
        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(245,196,81,0.2),transparent);"></div></td></tr>
        
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-0.02em;">You're on the list 🏆</h1>
          <p style="font-size:14px;color:#6b7a8d;line-height:1.8;margin:0 0 32px;">
            Welcome to AuScope early access. You've secured a priority spot ahead of our official launch. Here's what's waiting for you inside the terminal:
          </p>
          
          <!-- Features Grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="padding:16px 20px;background:rgba(245,196,81,0.05);border:1px solid rgba(245,196,81,0.1);border-radius:10px 10px 0 0;border-bottom:none;">
              <div style="font-size:13px;font-weight:700;color:#f5c451;margin-bottom:4px;">📊 Live Intelligence Dashboard</div>
              <div style="font-size:12px;color:#6b7a8d;line-height:1.6;">Real-time XAU/USD price streaming, interactive charts, and market overview — all in one unified dark-mode terminal.</div>
            </td></tr>
            <tr><td style="padding:16px 20px;background:rgba(245,196,81,0.03);border-left:1px solid rgba(245,196,81,0.1);border-right:1px solid rgba(245,196,81,0.1);">
              <div style="font-size:13px;font-weight:700;color:#f5c451;margin-bottom:4px;">🤖 AI-Powered Trade Signals</div>
              <div style="font-size:12px;color:#6b7a8d;line-height:1.6;">Machine learning models analyze technicals, sentiment, and macro data to deliver daily buy/sell/hold signals with confidence scores.</div>
            </td></tr>
            <tr><td style="padding:16px 20px;background:rgba(245,196,81,0.05);border-left:1px solid rgba(245,196,81,0.1);border-right:1px solid rgba(245,196,81,0.1);">
              <div style="font-size:13px;font-weight:700;color:#f5c451;margin-bottom:4px;">🌍 Geopolitical Heat Map</div>
              <div style="font-size:12px;color:#6b7a8d;line-height:1.6;">Visual map tracking global conflicts, sanctions, and central bank moves — each event scored by its impact on gold prices.</div>
            </td></tr>
            <tr><td style="padding:16px 20px;background:rgba(245,196,81,0.03);border-left:1px solid rgba(245,196,81,0.1);border-right:1px solid rgba(245,196,81,0.1);">
              <div style="font-size:13px;font-weight:700;color:#f5c451;margin-bottom:4px;">📰 Curated Gold News Feed</div>
              <div style="font-size:12px;color:#6b7a8d;line-height:1.6;">AI-filtered news aggregation pulling the most market-moving stories from global financial sources in real time.</div>
            </td></tr>
            <tr><td style="padding:16px 20px;background:rgba(245,196,81,0.05);border:1px solid rgba(245,196,81,0.1);border-radius:0 0 10px 10px;border-top:none;">
              <div style="font-size:13px;font-weight:700;color:#f5c451;margin-bottom:4px;">📅 Economic Calendar & Comms</div>
              <div style="font-size:12px;color:#6b7a8d;line-height:1.6;">Never miss a Fed decision, CPI release, or NFP report. Built-in messaging lets you connect with other gold traders.</div>
            </td></tr>
          </table>

          <!-- Your spot -->
          <div style="background:rgba(245,196,81,0.06);border:1px solid rgba(245,196,81,0.15);border-radius:10px;padding:20px;text-align:center;margin-bottom:8px;">
            <div style="font-size:11px;letter-spacing:0.14em;color:#f5c451;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Your Reserved Email</div>
            <div style="font-size:15px;font-weight:600;color:#e0e6ed;">${email}</div>
            <div style="font-size:11px;color:#4a5568;margin-top:8px;">We'll notify you the moment access opens. No action needed.</div>
          </div>
        </td></tr>
        
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;background:rgba(0,0,0,0.2);">
          <p style="font-size:10px;color:#2a3441;letter-spacing:0.08em;margin:0;">
            © 2026 AUSCOPE · ALL RIGHTS RESERVED<br/>
            You received this because you joined our waitlist.
          </p>
        </td></tr>
        
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // 1. Save to Supabase
  const { error: dbError } = await supabase.from('waitlist').insert([{ email }]);
  if (dbError && dbError.code !== '23505') {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // 2. Send email via Zoho (Nodemailer) only in Production
  let emailStatus = 'skipped';
  if (process.env.NODE_ENV === 'production') {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.ZOHO_EMAIL,
          pass: process.env.ZOHO_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"AuScope" <${process.env.ZOHO_EMAIL}>`,
        to: email,
        subject: "You're on the AuScope Waitlist — Access Coming Soon",
        html: emailHtml(email),
      });
      emailStatus = 'sent';
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Zoho email error:', errMsg);
      emailStatus = errMsg;
    }
  } else {
    console.log('Local Environment: Skipped sending waitlist email to', email);
  }

  return NextResponse.json({ success: true, emailStatus });
}
