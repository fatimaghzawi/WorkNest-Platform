"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Ensure all Mongoose models are registered before any populate/query runs. */
const load = (path) => {
    const mod = require(path);
    return mod.default || mod;
};
load('./User');
load('./Category');
load('./Job');
load('./Proposal');
load('./Project');
load('./Interview');
load('./Task');
load('./WorkspaceAttachment');
load('./Log');
module.exports = {};
