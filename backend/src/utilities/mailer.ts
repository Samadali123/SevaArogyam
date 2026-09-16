import nodemailer from 'nodemailer';

/**
 * Sends an email via Resend HTTPS REST API (Port 443 - Never blocked on Render)
 * or via standard Nodemailer SMTP for local fallback.
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const resendApiKey = process.env.RESEND_API_KEY;

  const resendFrom = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'JansevaArogyam <otp@jansevaarogyam.com>';

  // 1. Primary: Resend API (HTTPS Port 443 - Works reliably in production & Render)
  if (resendApiKey && resendApiKey.trim()) {
    try {
      console.log(`[MAILER] Sending email to ${to} via Resend HTTPS API from ${resendFrom}...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
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

  // 2. Fallback: Standard Nodemailer SMTP (For local dev / non-blocked servers)
  if (!user || !pass) {
    console.warn(`[MAILER] No RESEND_API_KEY or SMTP credentials available. Skipping email send to ${to}.`);
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
      from: resendFrom,
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
