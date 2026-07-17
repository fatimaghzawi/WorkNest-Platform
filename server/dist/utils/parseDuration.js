"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseDurationToMs = (value, fallbackMs) => {
    const trimmed = String(value || '').trim();
    const match = /^(\d+)([smhd])$/i.exec(trimmed);
    if (!match)
        return fallbackMs;
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] || 0) || fallbackMs;
};
module.exports = { parseDurationToMs };
