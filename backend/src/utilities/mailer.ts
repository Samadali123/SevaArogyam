import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js DNS resolution order to prefer IPv4 globally
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Resolves a hostname (e.g. smtp.gmail.com) to an explicit IPv4 IP string
 * to prevent Node.js net.connect from attempting IPv6 socket bindings (:::0)
 */
const getIPv4Address = async (hostname: string): Promise<string> => {
  try {
    const addresses = await dns.promises.resolve4(hostname);
    if (addresses && addresses.length > 0) {
      console.log(`[MAILER] Resolved ${hostname} to explicit IPv4 IP: ${addresses[0]}`);
      return addresses[0];
    }
  } catch (e) {
    console.warn(`[MAILER] DNS resolve4 failed for ${hostname}, using raw hostname.`, e);
  }
  return hostname;
};

/**
 * Sends an email using Nodemailer with explicit IPv4 IP binding and sanitized credentials
 * @param to The recipient email address
 * @param subject The subject line
 * @param html The HTML body of the email
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const user = (process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || '').trim();
  // Strip any spaces pasted into SMTP_PASS (e.g. "krxy hefs pwuh emtd" -> "krxyhefspwuhemtd")
  const cleanPass = rawPass.replace(/\s+/g, '');
  const pass = cleanPass || rawPass;

  if (!user || !pass) {
    console.warn(`[MAILER] SMTP_USER or SMTP_PASS environment variables are missing on server. Skipping email send to ${to}.`);
    return false;
  }

  const rawHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const emailData = {
    from: process.env.EMAIL_FROM || `"${user}" <${user}>`,
    to,
    subject,
    html,
  };

  // Resolve explicit IPv4 IP address (e.g. '142.250.141.108')
  const targetIP = await getIPv4Address(rawHost);

  // Attempt 1: Port 465 SSL via IPv4 IP address
  try {
    console.log(`[MAILER] Attempt 1: Sending via Port 465 SSL (IP: ${targetIP}, User: ${user})...`);
    const transporter = nodemailer.createTransport({
      host: targetIP,
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
      localAddress: '0.0.0.0', // Forces IPv4 local socket binding
      tls: {
        rejectUnauthorized: false,
        servername: rawHost, // SNI servername for TLS handshake
      },
    } as any);

    const info = await transporter.sendMail(emailData);
    console.log('[MAILER] Email sent successfully via Port 465 SSL to %s: %s', to, info.messageId);
    return true;
  } catch (error: any) {
    console.warn('[MAILER] Port 465 SSL attempt failed:', error?.message || error);
  }

  // Attempt 2: Port 587 STARTTLS via IPv4 IP address
  try {
    console.log(`[MAILER] Attempt 2: Sending via Port 587 STARTTLS (IP: ${targetIP})...`);
    const transporter587 = nodemailer.createTransport({
      host: targetIP,
      port: 587,
      secure: false, // STARTTLS
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
      localAddress: '0.0.0.0', // Forces IPv4 local socket binding
      tls: {
        rejectUnauthorized: false,
        servername: rawHost, // SNI servername for TLS handshake
      },
    } as any);

    const info = await transporter587.sendMail(emailData);
    console.log('[MAILER] Email sent successfully via Port 587 STARTTLS to %s: %s', to, info.messageId);
    return true;
  } catch (error: any) {
    console.error('[MAILER] Port 587 STARTTLS attempt failed:', error?.message || error);
  }

  // Attempt 3: Retry with original rawPass if cleanPass differed
  if (rawPass !== cleanPass) {
    try {
      console.log(`[MAILER] Attempt 3: Retrying with raw unstripped password format...`);
      const transporterRaw = nodemailer.createTransport({
        host: targetIP,
        port: 465,
        secure: true,
        auth: { user, pass: rawPass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
        localAddress: '0.0.0.0',
        tls: { rejectUnauthorized: false, servername: rawHost },
      } as any);

      const info = await transporterRaw.sendMail(emailData);
      console.log('[MAILER] Email sent successfully via Attempt 3 to %s: %s', to, info.messageId);
      return true;
    } catch (error: any) {
      console.error('[MAILER] Attempt 3 failed:', error?.message || error);
    }
  }

  return false;
};
