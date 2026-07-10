"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logService = require('../services/log.service');
const { sendSuccess } = require('../utils/response');
const listLogs = async (req, res) => {
    const result = await logService.listLogs(req.query);
    return sendSuccess(res, {
        message: 'Logs retrieved successfully',
        data: result.logs,
        meta: result.meta,
    });
};
const getLogStats = async (req, res) => {
    const stats = await logService.getLogStats();
    return sendSuccess(res, {
        message: 'Log statistics retrieved successfully',
        data: stats,
    });
};
module.exports = {
    listLogs,
    getLogStats,
};
