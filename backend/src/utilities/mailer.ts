import nodemailer from 'nodemailer';
import { env } from '@config/environment';

/**
 * Creates a reusable transporter object with short connection timeouts
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000,
    socketTimeout: 10000,
    // Force IPv4 to prevent ENETUNREACH errors on cloud platforms (e.g. Render) without IPv6 network routes
    family: 4,
  } as nodemailer.TransportOptions);
};

/**
 * Sends an email using Nodemailer
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
    
    if (env.isDevelopment) {
      console.log('[MAILER] Message sent: %s', info.messageId);
    }
    return true;
  } catch (error) {
    console.error('[MAILER] Error sending email:', error);
    return false;
  }
};

