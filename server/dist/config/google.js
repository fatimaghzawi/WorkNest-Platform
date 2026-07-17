"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env = require('./env');
const googleConfig = {
    clientId: env.google.clientId,
    isConfigured: Boolean(env.google.clientId),
};
module.exports = googleConfig;
