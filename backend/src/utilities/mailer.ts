import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js DNS resolution order to prefer IPv4 globally (prevents ENETUNREACH IPv6 errors on cloud platforms like Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Creates a reusable transporter object with forced IPv4 resolution for cloud hosting (Render)
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const rawPort = Number(process.env.SMTP_PORT);
  const port = rawPort || (host.includes('gmail') ? 465 : 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transporterOptions: any = {
    host,
    port,
    secure: port === 465, // true for port 465 (SSL), false for 587 (STARTTLS)
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 10000, // 10s connection timeout
    greetingTimeout: 10000,
    socketTimeout: 10000,
    family: 4, // Force IPv4
    lookup: (hostname: string, _options: any, callback: any) => {
      // Explicitly force IPv4 lookup to prevent ENETUNREACH IPv6 errors on Render
      dns.lookup(hostname, { family: 4, all: false }, callback);
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  return nodemailer.createTransport(transporterOptions);
};

/**
 * Sends an email using Nodemailer with automatic port 587 fallback if primary port encounters transport issues
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
    
    console.log('[MAILER] Message sent successfully to %s: %s', to, info.messageId);
    return true;
  } catch (error: any) {
    console.error('[MAILER] Error sending email with primary transporter:', error?.message || error);

    // Fallback: Attempt alternative transport on port 587 (STARTTLS)
    try {
      console.log('[MAILER] Attempting fallback transport (Port 587 STARTTLS with IPv4)...');
      const fallbackOptions: any = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        family: 4,
        lookup: (hostname: string, _options: any, callback: any) => {
          dns.lookup(hostname, { family: 4, all: false }, callback);
        },
        tls: {
          rejectUnauthorized: false,
        },
      };
      const fallbackTransporter = nodemailer.createTransport(fallbackOptions);

      const fallbackInfo = await fallbackTransporter.sendMail({
        from: process.env.EMAIL_FROM || `"${user}" <${user}>`,
        to,
        subject,
        html,
      });

      console.log('[MAILER] Fallback email sent successfully to %s: %s', to, fallbackInfo.messageId);
      return true;
    } catch (fallbackError: any) {
      console.error('[MAILER] Fallback transport also failed:', fallbackError?.message || fallbackError);
      return false;
    }
  }
};
