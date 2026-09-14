import nodemailer from 'nodemailer';

/**
 * Creates a clean SMTP transporter using environment configuration or standard Gmail service
 */
const getTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;

  // Use Nodemailer built-in Gmail service when host is Gmail
  if (host.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Sends an email directly at once using Nodemailer SMTP
 * @param to The recipient email address
 * @param subject The subject line
 * @param html The HTML body of the email
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn(`[MAILER] SMTP_USER or SMTP_PASS environment variables are missing on server. Skipping email send to ${to}.`);
    return false;
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"${user}" <${user}>`,
      to,
      subject,
      html,
    });
    
    console.log('[MAILER] Email sent successfully to %s: %s', to, info.messageId);
    return true;
  } catch (error: any) {
    console.error('[MAILER] Error sending email:', error?.message || error);
    return false;
  }
};
