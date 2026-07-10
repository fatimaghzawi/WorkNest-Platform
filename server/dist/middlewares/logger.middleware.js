"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const morgan = require('morgan');
const env = require('../config/env');
const logger = morgan(env.isProduction ? 'combined' : 'dev');
module.exports = logger;
