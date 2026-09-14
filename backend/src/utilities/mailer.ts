import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js DNS resolution order to prefer IPv4 globally (prevents ENETUNREACH IPv6 errors on cloud platforms like Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Resolves a hostname (e.g. smtp.gmail.com) to an explicit IPv4 IP string
 * to prevent Node.js net.connect from creating IPv6 socket bindings (:::0)
 */
const resolveIPv4Address = async (hostname: string): Promise<string> => {
  try {
    const addresses = await dns.promises.resolve4(hostname);
    if (addresses && addresses.length > 0) {
      console.log(`[MAILER] Resolved ${hostname} to IPv4 address: ${addresses[0]}`);
      return addresses[0];
    }
  } catch (e) {
    console.warn(`[MAILER] DNS resolve4 failed for ${hostname}, using raw hostname.`, e);
  }
  return hostname;
};

/**
 * Creates transporter using explicit IPv4 IP address and localAddress binding '0.0.0.0'
 */
const createIPv4Transporter = async (port: number, secure: boolean) => {
  const rawHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const ipHost = await resolveIPv4Address(rawHost);

  const transporterOptions: any = {
    host: ipHost,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    family: 4,
    localAddress: '0.0.0.0', // Forces IPv4 socket binding (eliminates Local :::0 ENETUNREACH)
    tls: {
      rejectUnauthorized: false,
      servername: rawHost, // SNI servername for TLS certificate verification
    },
  };

  return nodemailer.createTransport(transporterOptions);
};

/**
 * Creates transporter using Nodemailer built-in 'gmail' service helper
 */
const createGmailServiceTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transporterOptions: any = {
    service: 'gmail',
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    family: 4,
    localAddress: '0.0.0.0',
    tls: {
      rejectUnauthorized: false,
    },
  };

  return nodemailer.createTransport(transporterOptions);
};

/**
 * Sends an email using Nodemailer with multi-strategy IPv4 connection fallbacks
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

  const emailOptions = {
    from: process.env.EMAIL_FROM || `"${user}" <${user}>`,
    to,
    subject,
    html,
  };

  // Strategy 1: Direct IPv4 connection on Port 465 (SSL) with localAddress 0.0.0.0
  try {
    console.log(`[MAILER] Attempting Strategy 1 (IPv4 Direct IP, Port 465 SSL) for ${to}...`);
    const transporter = await createIPv4Transporter(465, true);
    const info = await transporter.sendMail(emailOptions);
    console.log('[MAILER] Strategy 1 succeeded. Message sent to %s: %s', to, info.messageId);
    return true;
  } catch (error: any) {
    console.warn('[MAILER] Strategy 1 failed:', error?.message || error);
  }

  // Strategy 2: Nodemailer Built-in Gmail Service Transport
  try {
    console.log(`[MAILER] Attempting Strategy 2 (Gmail Service Helper) for ${to}...`);
    const gmailTransporter = createGmailServiceTransporter();
    const info = await gmailTransporter.sendMail(emailOptions);
    console.log('[MAILER] Strategy 2 succeeded. Message sent to %s: %s', to, info.messageId);
    return true;
  } catch (error: any) {
    console.warn('[MAILER] Strategy 2 failed:', error?.message || error);
  }

  // Strategy 3: Direct IPv4 connection on Port 587 (STARTTLS)
  try {
    console.log(`[MAILER] Attempting Strategy 3 (IPv4 Direct IP, Port 587 STARTTLS) for ${to}...`);
    const fallbackTransporter = await createIPv4Transporter(587, false);
    const info = await fallbackTransporter.sendMail(emailOptions);
    console.log('[MAILER] Strategy 3 succeeded. Message sent to %s: %s', to, info.messageId);
    return true;
  } catch (error: any) {
    console.error('[MAILER] Strategy 3 failed:', error?.message || error);
  }

  return false;
};
