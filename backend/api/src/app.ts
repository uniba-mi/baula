/** ----------------------------
 *  ------- Imports ------------
    ---------------------------- */
import './config/env.config'
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { api } from "./routes/api.router";

import { authSaml } from "./routes/auth/auth-saml.routes";
import { localLogin, localLogout } from "./routes/auth/auth-local.routes";
import passport from "./config/passport.config";
import { expressSession } from "./config/session.config";
import { errorHandler, notFoundHandler } from "./shared/middleware/error-handler-middleware";
import { logger } from "./shared/utils/logger";

const app: Express = express();

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

// Always enable CORS with configured origins
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting to prevent brute force and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for Swagger docs and health checks
    return req.path.startsWith('/api/docs') || req.path === '/api/health';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Zu viele Requests. Bitte warte 15 Minuten.',
        status: 429,
      },
    });
  },
});

app.use(limiter);

// Enable compression for faster responses
app.use(compression());

/** ------------------------------
 *  -- Configurating middleware --
 *  -----------------------------*/
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json({ limit: "100mb" }));

// Enhanced logging with morgan
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '0ms';
});

app.use(
  morgan(':method :url :status :response-time-ms - :remote-addr - :user-agent', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

mongoose.set("strictQuery", true);

/** Helmet configuration - enhanced security headers */
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", process.env.PLAUSIBLE_URL ?? "", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", process.env.PLAUSIBLE_URL ?? ""],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  })
);

// session and passport configuration
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

/** ------------------------------
 *  ---------- Routes ------------
 *  -----------------------------*/
app.use('/login', localLogin);
app.use('/logout', localLogout);
app.use("/Shibboleth.sso", authSaml);
app.use("/api", api);

/** ------------------------------
 *  ------ Error handling --------
 *  -----------------------------*/
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
