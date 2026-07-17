"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const emailConfig = require('../../config/email');
const env = require('../../config/env');
const { createTransporter } = require('../../config/transporter');
const { renderTemplate } = require('./template.service');
const { withTimeout } = require('../../utils/promise.util');
const EMAIL_SEND_TIMEOUT_MS = 30000;
const parseFromAddress = (from) => {
    const match = from.match(/^(.+?)\s*<(.+?)>$/);
    if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
    }
    return { email: from.trim() };
};
class EmailService {
    async verifyConnection() {
        if (!env.email.isConfigured) {
            const message = 'Email is not configured. Set ELASTICEMAIL_API_KEY, SENDGRID_API_KEY, or EMAIL_USER + EMAIL_PASS.';
            console.error(`[EmailService] ${message}`);
            if (env.isProduction) {
                throw new Error(message);
            }
            return false;
        }
        try {
            if (env.email.sendgridApiKey) {
                sgMail.setApiKey(env.email.sendgridApiKey);
                console.log(`[EmailService] SendGrid ready (from: ${emailConfig.from})`);
                return true;
            }
            if (env.email.elasticEmailApiKey) {
                console.log(`[EmailService] Elastic Email API ready (from: ${emailConfig.from})`);
                return true;
            }
            const transporter = await createTransporter();
            await transporter.verify();
            console.log(`[EmailService] SMTP verified (${env.email.host}:${env.email.port})`);
            return true;
        }
        catch (error) {
            console.error('[EmailService] Email setup failed:', error.message);
            if (error.code) {
                console.error('[EmailService] Error code:', error.code);
            }
            if (env.isProduction) {
                throw error;
            }
            return false;
        }
    }
    async sendViaSendGrid({ to, subject, html, text, }) {
        sgMail.setApiKey(env.email.sendgridApiKey);
        const response = await withTimeout(sgMail.send({
            to,
            from: parseFromAddress(emailConfig.from),
            subject,
            html,
            text: text || undefined,
        }), EMAIL_SEND_TIMEOUT_MS, 'SendGrid email send timed out');
        console.log(`[EmailService] SendGrid sent to ${to}: ${subject} (${response[0].statusCode})`);
        return response;
    }
    async sendViaElasticEmail({ to, subject, html, text, }) {
        const from = parseFromAddress(emailConfig.from);
        const fromHeader = from.name ? `${from.name} <${from.email}>` : from.email;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), EMAIL_SEND_TIMEOUT_MS);
        let response;
        try {
            response = await fetch('https://api.elasticemail.com/v4/emails/transactional', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-ElasticEmail-ApiKey': env.email.elasticEmailApiKey,
                },
                body: JSON.stringify({
                    Recipients: { To: [to] },
                    Content: {
                        From: fromHeader,
                        Subject: subject,
                        Body: [
                            {
                                ContentType: 'HTML',
                                Charset: 'utf-8',
                                Content: html,
                            },
                            ...(text
                                ? [
                                    {
                                        ContentType: 'PlainText',
                                        Charset: 'utf-8',
                                        Content: text,
                                    },
                                ]
                                : []),
                        ],
                    },
                }),
                signal: controller.signal,
            });
        }
        catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Elastic Email send timed out');
            }
            throw error;
        }
        finally {
            clearTimeout(timeout);
        }
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Elastic Email API error (${response.status}): ${errorBody}`);
        }
        const result = await response.json();
        const messageId = result?.TransactionID || result?.MessageID || 'unknown';
        console.log(`[EmailService] Elastic Email sent to ${to}: ${subject} (id: ${messageId})`);
        return result;
    }
    async sendViaSmtp({ to, subject, html, text, }) {
        const transporter = await createTransporter();
        const info = await withTimeout(transporter.sendMail({
            from: emailConfig.from,
            to,
            subject,
            html,
            text: text || undefined,
        }), EMAIL_SEND_TIMEOUT_MS, 'SMTP email send timed out');
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[EmailService] Preview URL: ${previewUrl}`);
        }
        else {
            console.log(`[EmailService] SMTP sent to ${to}: ${subject} (${info.messageId})`);
        }
        return info;
    }
    async send({ to, subject, html, text, }) {
        if (env.email.sendgridApiKey) {
            return this.sendViaSendGrid({ to, subject, html, text });
        }
        if (env.email.elasticEmailApiKey) {
            return this.sendViaElasticEmail({ to, subject, html, text });
        }
        return this.sendViaSmtp({ to, subject, html, text });
    }
    async sendVerificationEmail({ to, firstName, token, }) {
        const verificationUrl = `${env.appUrl}/api/auth/verify-email/${token}`;
        const year = new Date().getFullYear().toString();
        const html = renderTemplate('verification.html', {
            firstName,
            verificationUrl,
            appName: env.appName,
            year,
        });
        return this.send({
            to,
            subject: `Verify your ${env.appName} email address`,
            html,
        });
    }
    async sendPasswordResetEmail({ to, firstName, token, }) {
        const resetUrl = `${env.appUrl}/api/auth/reset-password/${token}`;
        const year = new Date().getFullYear().toString();
        const html = renderTemplate('password-reset.html', {
            firstName,
            resetUrl,
            appName: env.appName,
            year,
        });
        const text = [
            `Hi ${firstName},`,
            '',
            `We received a request to reset your ${env.appName} password.`,
            `Open this link to choose a new password (expires in 15 minutes):`,
            resetUrl,
            '',
            `If you did not request this, you can ignore this email.`,
        ].join('\n');
        return this.send({
            to,
            subject: `Reset your ${env.appName} password`,
            html,
            text,
        });
    }
    async sendEventNotificationEmail({ to, firstName, title, message, actionUrl, actionLabel = 'Open dashboard', }) {
        const year = new Date().getFullYear().toString();
        const actionButtonHtml = actionUrl
            ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#49225B;border-radius:8px;">
                    <a href="${actionUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                      ${actionLabel}
                    </a>
                  </td>
                </tr>
              </table>`
            : '';
        const html = renderTemplate('event-notification.html', {
            firstName,
            title,
            message,
            appName: env.appName,
            year,
            actionButtonHtml,
        });
        const text = [`Hi ${firstName},`, '', message, '', actionUrl ? `${actionLabel}: ${actionUrl}` : '', '']
            .filter(Boolean)
            .join('\n');
        return this.send({
            to,
            subject: `${title} — ${env.appName}`,
            html,
            text,
        });
    }
}
module.exports = new EmailService();
