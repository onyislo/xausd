import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      <table width="100%" style="max-width:560px;background:linear-gradient(180deg,#131a26 0%,#0a0e17 100%);border-radius:16px;border:1px solid #2a3441;overflow:hidden;">
        
        <!-- Gold top bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#f5c451,transparent);"></td></tr>
        
        <!-- Header -->
        <tr><td style="padding:40px 40px 32px;text-align:center;">
          <!-- Logo -->
          <div style="display:inline-block;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#f5c451,#b8860b);margin-bottom:20px;line-height:52px;text-align:center;">
            <span style="font-size:22px;line-height:52px;display:inline-block;">▦</span>
          </div>
          <div style="font-size:11px;letter-spacing:0.2em;color:#f5c451;text-transform:uppercase;font-weight:700;margin-bottom:6px;">AuScope</div>
          <div style="font-size:10px;letter-spacing:0.14em;color:#4a5568;text-transform:uppercase;">XAU/USD Intelligence Terminal</div>
        </td></tr>
        
        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background:rgba(255,255,255,0.05);"></div></td></tr>
        
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="font-size:22px;font-weight:800;color:#e0e6ed;margin:0 0 12px;letter-spacing:-0.02em;">You're on the list. 🏆</h1>
          <p style="font-size:14px;color:#6b7a8d;line-height:1.8;margin:0 0 28px;">
            Welcome to the AuScope early access program. You've secured your spot ahead of our official launch date.
          </p>
          
          <!-- Highlight box -->
          <div style="background:rgba(245,196,81,0.06);border:1px solid rgba(245,196,81,0.15);border-radius:10px;padding:24px;margin-bottom:28px;">
            <div style="font-size:11px;letter-spacing:0.14em;color:#f5c451;text-transform:uppercase;font-weight:700;margin-bottom:12px;">What's coming for you</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${['Real-time XAU/USD AI signals', 'Geopolitical heat map & economic calendar', 'Live market intelligence dashboard', 'Priority access before public launch'].map(f => `
              <tr><td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                <span style="color:#f5c451;font-size:12px;margin-right:10px;">✓</span>
                <span style="font-size:13px;color:#8a9bb2;">${f}</span>
              </td></tr>`).join('')}
            </table>
          </div>
          
          <p style="font-size:13px;color:#4a5568;line-height:1.8;margin:0 0 8px;">
            We'll email you at <strong style="color:#8a9bb2;">${email}</strong> the moment access opens. No action needed.
          </p>
        </td></tr>
        
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
          <p style="font-size:10px;color:#2a3441;letter-spacing:0.08em;margin:0;">
            © 2025 AUSCOPE · ALL RIGHTS RESERVED<br/>
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

  // 2. Send email via Brevo
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: 'AuScope', email: 'waitlist@yourdomain.com' },
      to: [{ email }],
      subject: "You're on the AuScope Waitlist — Access Coming Soon",
      htmlContent: emailHtml(email),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Resend error:', err);
    // Still return success — user is on the waitlist even if email fails
  }

  return NextResponse.json({ success: true });
}
