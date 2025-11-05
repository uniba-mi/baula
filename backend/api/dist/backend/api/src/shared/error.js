"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.NotFoundError = exports.BadRequestError = void 0;
exports.logError = logError;
const logger_1 = require("./utils/logger");
class BadRequestError extends Error {
    constructor(message = "The request was invalid or malformed.") {
        super(message);
        this.statusCode = 400;
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends Error {
    constructor(message = "The requested resource could not be found.") {
        super(message);
        this.statusCode = 404;
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.statusCode = 401;
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
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
        const error = new Error(`This value was thrown as is, not through an error: ${stringified}`);
        logger_1.logger.error(error.message);
    }
}
