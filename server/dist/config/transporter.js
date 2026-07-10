"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require('nodemailer');
const dns = require('dns');
const env = require('./env');
dns.setDefaultResultOrder('ipv4first');
let cachedTransporter = null;
const createTransporter = async () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }
    if (env.email.user && env.email.pass) {
        cachedTransporter = nodemailer.createTransport({
            host: env.email.host,
            port: env.email.port,
            secure: env.email.secure,
            family: 4, //ipv4
            requireTLS: !env.email.secure && env.email.port === 587,
            auth: {
                user: env.email.user,
                pass: env.email.pass,
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 20000,
        });
        console.log(`[EmailService] SMTP transporter ready (${env.email.host}, IPv4)`);
        return cachedTransporter;
    }
    if (env.isProduction) {
        throw new Error('Email is not configured for production. Set SENDGRID_API_KEY (recommended on Render) or EMAIL_USER + EMAIL_PASS.');
    }
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
    console.log('[EmailService] Ethereal test account created');
    console.log(`[EmailService] Ethereal user: ${testAccount.user}`);
    return cachedTransporter;
};
module.exports = {
    createTransporter,
};
