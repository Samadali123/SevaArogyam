import nodemailer from 'nodemailer';
import { env } from '@config/environment';

/**
 * Creates the reusable transporter object using the default SMTP transport
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email using Nodemailer
 * @param to The recipient email address
 * @param subject The subject line
 * @param html The HTML body of the email
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Sevasadan Portal" <no-reply@sevasadan.com>',
      to,
      subject,
      html,
    });
    
    // In development mode, log the email details
    if (env.isDevelopment) {
      console.log('Message sent: %s', info.messageId);
      // For ethereal email if ever used, you can log preview URL here
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
