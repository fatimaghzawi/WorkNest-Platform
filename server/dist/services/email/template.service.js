"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const resolveServerRoot = () => {
    const candidates = [
        path.resolve(__dirname, '../../..'),
        process.cwd(),
        path.join(process.cwd(), 'server'),
    ];
    const match = candidates.find((dir) => fs.existsSync(path.join(dir, 'templates', 'emails', 'verification.html')));
    if (!match) {
        throw new Error('Email templates directory not found');
    }
    return match;
};
const serverRoot = resolveServerRoot();
const templatesDir = path.join(serverRoot, 'templates', 'emails');
const logoCandidates = [
    path.join(serverRoot, 'assets', 'logo.png'),
    path.resolve(serverRoot, '../client/src/images/logo.png'),
];
let cachedLogoDataUri = null;
const getLogoDataUri = () => {
    if (cachedLogoDataUri) {
        return cachedLogoDataUri;
    }
    const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
    if (!logoPath) {
        cachedLogoDataUri = '';
        return cachedLogoDataUri;
    }
    const logoBuffer = fs.readFileSync(logoPath);
    const base64 = logoBuffer.toString('base64');
    cachedLogoDataUri = `data:image/png;base64,${base64}`;
    return cachedLogoDataUri;
};
const loadTemplate = (filename) => {
    return fs.readFileSync(path.join(templatesDir, filename), 'utf-8');
};
const renderTemplate = (filename, variables) => {
    let html = loadTemplate(filename);
    const allVariables = {
        logoUrl: getLogoDataUri(),
        ...variables,
    };
    Object.entries(allVariables).forEach(([key, value]) => {
        html = html.split(`{{${key}}}`).join(value);
    });
    return html;
};
module.exports = {
    renderTemplate,
    getLogoDataUri,
};
