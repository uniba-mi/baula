"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronjobLogger = exports.logger = void 0;
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const logDirectory = path_1.default.join(__dirname, '../../logs');
exports.logger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
    transports: [
        new winston_1.transports.Console({ level: 'info' }),
        new winston_1.transports.File({ filename: path_1.default.join(logDirectory, 'error.log'), level: 'error', format: winston_1.format.json() }),
        new winston_1.transports.File({ filename: path_1.default.join(logDirectory, 'combined.log'), level: 'info', format: winston_1.format.json() })
    ]
});
exports.cronjobLogger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
    transports: [
        new winston_1.transports.File({ filename: path_1.default.join(logDirectory, 'cronjob.log'), format: winston_1.format.json() })
    ]
});
