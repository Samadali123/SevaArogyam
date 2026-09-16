/**
 * Sends an email via Resend HTTPS REST API (Port 443 - Works in production & Render).
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || 'JansevaArogyam <otp@jansevaarogyam.com>';

  if (!resendApiKey || !resendApiKey.trim()) {
    console.warn(`[MAILER] RESEND_API_KEY is missing in environment variables. Skipping email send to ${to}.`);
    return false;
  }

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
      return false;
    }
  } catch (err: any) {
    console.error('[MAILER] Resend HTTPS request failed:', err?.message || err);
    return false;
  }
};
