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
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const transporterOptions = {
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,
        socketTimeout: 10000,
        // Force IPv4 to prevent ENETUNREACH errors on cloud platforms (e.g. Render) without IPv6 network routes
        family: 4,
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