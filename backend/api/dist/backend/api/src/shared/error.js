"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.BadRequestError = void 0;
exports.logError = logError;
const logger_1 = require("./logger");
class BadRequestError extends Error {
    constructor(message, name) {
        super(message ? message : "Es ist ein Fehler aufgetreten.");
        this.name = name ? name : "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends Error {
    constructor(message, name) {
        super(message
            ? message
            : "Die angefragte Resource konnte nicht gefunden werden.");
        this.name = name ? name : "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
function logError(value) {
    if (value instanceof Error) {
        logger_1.logger.error(value.message);
    }
    else {
        let stringified = "[Unable to stringify the thrown value]";
        try {
            stringified = JSON.stringify(value);
        }
        catch (error) { }
        const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`);
        logger_1.logger.error(error.message);
    }
}
