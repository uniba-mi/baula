"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const error_1 = require("../error");
function notFoundHandler(req, res, next) {
    next(new Error("Not Found"));
}
function errorHandler(err, req, res, next) {
    const status = err.statusCode || (err.name === "UnauthorizedError" ? 401 : 500);
    const message = err.message || "Internal Server Error";
    (0, error_1.logError)(err);
    res.status(status).json({
        error: {
            name: err.name,
            message,
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
        },
    });
}
