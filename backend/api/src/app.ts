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
import cookieParser from "cookie-parser";
import { api } from "./routes/api.router";

import { authSaml } from "./routes/auth/auth-saml.routes";
import { localLogin, localLogout } from "./routes/auth/auth-local.routes";
import passport from "./config/passport.config";
import { expressSession } from "./config/session.config";
import { errorHandler, notFoundHandler } from "./shared/middleware/error-handler-middleware";
import { csrfProtectionMiddleware } from "./shared/middleware/csrf-middleware";
import { logger } from "./shared/utils/logger";

const app: Express = express();

// trust the first hop (reverse proxy) so req.ip / X-Forwarded-For reflect the real client
app.set("trust proxy", 1);

// cors for local setting
if (process.env.NODE_ENV === "local" && process.env.ORIGIN) {
  app.use(
    cors({
      origin: [
        process.env.ORIGIN,
      ],
      credentials: true,
    })
  );
}

// Rate limiting to prevent brute force and DDoS attacks
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Max 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for Swagger docs
    return req.path.startsWith('/api/docs');
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Zu viele Requests. Bitte warte kurz und versuche es erneut.',
        status: 429,
      },
    });
  },
});

app.use(limiter);

// Stricter rate limit specifically for the local login endpoint (brute force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Zu viele Login-Versuche. Bitte warte 15 Minuten.',
        status: 429,
      },
    });
  },
});

// Enable compression for faster responses
app.use(compression());

// Parse cookies for CSRF protection
app.use(cookieParser());

// Mounted globally (not scoped to /api) so its own path-based exemptions
// see the real, unstripped request path - Express strips the mount prefix
// from req.path for middleware mounted via app.use('/api', ...).
app.use(csrfProtectionMiddleware);

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
  morgan(':method :url :status :response-time - :remote-addr - :user-agent', {
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
        scriptSrc: ["'self'", process.env.PLAUSIBLE_URL ?? ""],
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
app.use('/login', loginLimiter, localLogin);
app.use('/logout', localLogout);
app.use("/Shibboleth.sso", authSaml);
app.use("/api", api);

/** ------------------------------
 *  ------ Error handling --------
 *  -----------------------------*/
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
