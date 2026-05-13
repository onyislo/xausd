import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Create a Supabase client with the service role key for admin tasks
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const inviteEmailHtml = (email: string, resetLink: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AuScope  Your Access is Ready</title>
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
          <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 8px;letter-spacing:-0.02em;">Quick Confirmation 🛡️</h1>
          
          <div style="background:rgba(245,196,81,0.1);border-left:4px solid #f5c451;padding:16px;margin-bottom:24px;">
            <p style="font-size:13px;color:#f5c451;font-weight:700;margin:0 0 4px;text-transform:uppercase;">Technical Note:</p>
            <p style="font-size:13px;color:#e0e6ed;margin:0;line-height:1.5;">This is just to confirm that the **3rd email** we sent you contains the correct and final access link. Please use that link to set your password and join the terminal.</p>
            <p style="font-size:13px;color:#e0e6ed;margin:8px 0 0;line-height:1.5;">We apologize for any inconvenience caused.</p>
          </div>

          <p style="font-size:14px;color:#6b7a8d;line-height:1.8;margin:0 0 32px;">
            We appreciate your patience while we resolved the technical issues with the initial links. We look forward to seeing you inside the AuScope terminal.
          </p>
          
          <div style="background:rgba(245,196,81,0.06);border:1px solid rgba(245,196,81,0.15);border-radius:10px;padding:20px;text-align:center;">
            <div style="font-size:11px;letter-spacing:0.14em;color:#f5c451;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Your Registered Email</div>
            <div style="font-size:15px;font-weight:600;color:#e0e6ed;">${email}</div>
          </div>
        </td></tr>
        
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;background:rgba(0,0,0,0.2);">
          <p style="font-size:10px;color:#2a3441;letter-spacing:0.08em;margin:0;">
            © 2026 AUSCOPE · ALL RIGHTS RESERVED<br/>
            You received this because you were previously on our waitlist.
          </p>
        </td></tr>
        
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export async function POST(req: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is missing from .env.local. This is required for admin tasks like creating users.' }, { status: 500 });
    }

    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json({ error: 'BREVO_API_KEY is missing from .env.local.' }, { status: 500 });
    }

    // 1. Fetch all people from the waitlist
    // We only select emails that haven't been processed yet if possible
    // For now, we'll fetch all and the logic will handle existing auth users
    const { data: waitlistUsers, error: waitlistError } = await supabaseAdmin
      .from('waitlist')
      .select('email');

    if (waitlistError) throw waitlistError;

    if (!waitlistUsers || waitlistUsers.length === 0) {
      return NextResponse.json({ message: 'No waitlist users found' });
    }

    const results = [];

    for (const entry of waitlistUsers) {
      const email = entry.email;

      try {
        // 2. Check if user already exists in Auth
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        let user = users.find(u => u.email === email);

        if (!user) {
          // 3. Create the user if they don't exist
          // We create them with a random password since they will reset it anyway
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            password: Math.random().toString(36).slice(-12) + 'A1!',
            user_metadata: { source: 'waitlist_migration' }
          });

          if (createError) {
            results.push({ email, status: 'error', error: createError.message });
            continue;
          }
          user = newUser.user;
        }

        // 4. Generate recovery (reset password) link
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: {
            redirectTo: `https://auscope.mic3solutiongroup.com/reset-password`
          }
        });

        if (linkError) {
          results.push({ email, status: 'error', error: linkError.message });
          continue;
        }

        const resetLink = linkData.properties.action_link;

        // 5. Send email via Brevo
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY!,
          },
          body: JSON.stringify({
            sender: { name: 'AuScope', email: 'no.reply@auscope.mic3solutiongroup.com' },
            to: [{ email }],
            subject: "Your AuScope Early Access — Set Your Password",
            htmlContent: inviteEmailHtml(email, resetLink),
            textContent: `Welcome to AuScope! You've been granted early access. Set your password here: ${resetLink}`,
          }),
        });

        if (!brevoRes.ok) {
          const err = await brevoRes.json();
          results.push({ email, status: 'error', error: 'Brevo failed: ' + JSON.stringify(err) });
        } else {
          results.push({ email, status: 'success' });
        }

      } catch (innerError: any) {
        results.push({ email, status: 'error', error: innerError.message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results
    });

  } catch (error: any) {
    console.error('Migration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
