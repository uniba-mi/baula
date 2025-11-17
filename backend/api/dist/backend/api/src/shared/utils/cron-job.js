"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("./logger");
const univis_crawler_1 = require("../helpers/univis-crawler");
const semester_1 = require("../../semester");
// CRON job: execute at 3 AM from Monday to Friday
node_cron_1.default.schedule("0 3 * * 1-5", () => {
    const message = `CRON job is running: ${new Date().toLocaleString()}`;
    logger_1.cronjobLogger.info(message);
    const semester = new semester_1.Semester().name;
    (0, univis_crawler_1.processUnivisData)(semester).then((messages) => {
        for (const message of messages) {
            logger_1.cronjobLogger.info(message);
        }
    });
});
logger_1.cronjobLogger.info("CRON job started");
