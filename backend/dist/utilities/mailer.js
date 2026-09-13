"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const environment_1 = require("../config/environment.js");
/**
 * Creates a reusable transporter object with short connection timeouts
 */
const getTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    // Default to port 465 (SSL) for Gmail on cloud hosting like Render to avoid port 587 block
    const port = Number(process.env.SMTP_PORT) || (host.includes('gmail') ? 465 : 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const transporterOptions = {
        host,
        port,
        secure: port === 465, // true for port 465, false for 587
        auth: user && pass ? { user, pass } : undefined,
        connectionTimeout: 4000, // 4 seconds timeout
        greetingTimeout: 4000,
        socketTimeout: 5000,
        family: 4, // Force IPv4 for cloud platforms
        tls: {
            rejectUnauthorized: false,
        },
    };
    return nodemailer_1.default.createTransport(transporterOptions);
};
/**
 * Sends an email using Nodemailer
 * @param to The recipient email address
 * @param subject The subject line
 * @param html The HTML body of the email
 */
const sendEmail = async (to, subject, html) => {
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
        if (environment_1.env.isDevelopment) {
            console.log('[MAILER] Message sent: %s', info.messageId);
        }
        return true;
    }
    catch (error) {
        console.error('[MAILER] Error sending email:', error);
        return false;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.js.map