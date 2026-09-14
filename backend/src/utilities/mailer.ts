import nodemailer from 'nodemailer';

/**
 * Sends an email via HTTPS REST API (Port 443 - Never blocked on Render free tier)
 * or via standard Nodemailer SMTP for local development.
 * 
 * Recommended for Render Free Instance: Set RESEND_API_KEY or BREVO_API_KEY in Render Environment Variables.
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;

  const fromEmail = process.env.EMAIL_FROM || `"${user || 'SevaArogyam'}" <${user || 'noreply@sevasadanclinic.in'}>`;

  // 1. Resend API (HTTPS Port 443 - Never blocked on Render free tier)
  if (resendApiKey && resendApiKey.trim()) {
    try {
      console.log(`[MAILER] Sending email to ${to} via Resend HTTPS API (Port 443)...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SevaArogyam <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      const data: any = await response.json();
      if (response.ok) {
        console.log('[MAILER] Resend HTTPS API succeeded. Message ID:', data.id);
        return true;
      } else {
        console.warn('[MAILER] Resend API error:', data);
      }
    } catch (err: any) {
      console.error('[MAILER] Resend HTTPS request failed:', err?.message || err);
    }
  }

  // 2. Brevo API (HTTPS Port 443 - Never blocked on Render free tier)
  if (brevoApiKey && brevoApiKey.trim()) {
    try {
      console.log(`[MAILER] Sending email to ${to} via Brevo HTTPS API (Port 443)...`);
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey.trim(),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'SevaArogyam', email: user || 'samadali0125@gmail.com' },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
        }),
      });

      const data: any = await response.json();
      if (response.ok) {
        console.log('[MAILER] Brevo HTTPS API succeeded. Message ID:', data.messageId);
        return true;
      } else {
        console.warn('[MAILER] Brevo API error:', data);
      }
    } catch (err: any) {
      console.error('[MAILER] Brevo HTTPS request failed:', err?.message || err);
    }
  }

  // 3. Fallback: Standard Nodemailer SMTP (For local dev / non-blocked servers)
  if (!user || !pass) {
    console.warn(`[MAILER] No API keys or SMTP credentials available. Skipping email send to ${to}.`);
    return false;
  }

  try {
    const rawHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const cleanPass = pass.replace(/\s+/g, '');
    const isGmail = rawHost.includes('gmail');

    console.log(`[MAILER] Attempting Nodemailer SMTP send to ${to}...`);
    const transporter = nodemailer.createTransport({
      service: isGmail ? 'gmail' : undefined,
      host: isGmail ? undefined : rawHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass: cleanPass || pass },
      connectionTimeout: 10000,
      tls: { rejectUnauthorized: false },
    } as any);

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });

    console.log('[MAILER] SMTP Email sent successfully to %s: %s', to, info.messageId);
    return true;
  } catch (error: any) {
    console.error('[MAILER] SMTP send failed:', error?.message || error);
    return false;
  }
};
