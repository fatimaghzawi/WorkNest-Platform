"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logRepository = require('../repositories/log.repository');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const formatLog = (log) => ({
    _id: log._id.toString(),
    level: log.level,
    message: log.message,
    source: log.source,
    category: log.category,
    statusCode: log.statusCode ?? null,
    method: log.method ?? null,
    path: log.path ?? null,
    userId: log.userId ? String(log.userId) : null,
    actorEmail: log.actorEmail ?? null,
    ip: log.ip ?? null,
    meta: log.meta ?? null,
    createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : null,
});
const writeLog = async (payload) => {
    try {
        const log = await logRepository.create(payload);
        return formatLog(log.toObject ? log.toObject() : log);
    }
    catch (error) {
        console.error('[LogService] Failed to persist log:', error.message);
        return null;
    }
};
const writeLogSafe = (payload) => {
    writeLog(payload).catch(() => undefined);
};
const listLogs = async (query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.level && query.level !== 'all') {
        filter.level = query.level;
    }
    if (query.source) {
        filter.source = String(query.source);
    }
    if (query.search) {
        const searchRegex = new RegExp(String(query.search), 'i');
        filter.$or = [
            { message: searchRegex },
            { source: searchRegex },
            { category: searchRegex },
            { actorEmail: searchRegex },
            { path: searchRegex },
        ];
    }
    const [logs, total] = await Promise.all([
        logRepository.findAll({
            filter,
            skip,
            limit,
            sort: { createdAt: -1 },
        }),
        logRepository.count(filter),
    ]);
    return {
        logs: logs.map(formatLog),
        meta: buildPaginationMeta(total, page, limit),
    };
};
const getLogStats = async () => {
    const [byLevel, recent24h] = await Promise.all([
        logRepository.countByLevel(),
        logRepository.countRecent(24),
    ]);
    return {
        ...byLevel,
        last24h: recent24h,
    };
};
module.exports = {
    writeLog,
    writeLogSafe,
    listLogs,
    getLogStats,
};
