"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { renderPage } = require('../utils/view');
const renderEmailVerificationResultPage = ({ title, message, success, }) => renderPage('email-verification-result.html', {
    title,
    message,
    icon: success ? '✅' : '❌',
    titleClass: success ? 'success' : 'error',
});
module.exports = {
    renderEmailVerificationResultPage,
};
