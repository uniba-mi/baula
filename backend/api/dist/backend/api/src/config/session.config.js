"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressSession = exports.redisClient = void 0;
const connect_redis_1 = require("connect-redis");
const redis_1 = require("redis");
const express_session_1 = __importDefault(require("express-session"));
// configurate redis
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
// configure and export session
exports.expressSession = (0, express_session_1.default)({
    store: new connect_redis_1.RedisStore({ client: exports.redisClient }),
    secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : "",
    name: process.env.SESSION_NAME ? process.env.SESSION_NAME : "baulaSession",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        secure: process.env.COOKIE_SECURE === "true" ? true : false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 8 * 60 * 60 * 1000,
        sameSite: true,
    },
});
