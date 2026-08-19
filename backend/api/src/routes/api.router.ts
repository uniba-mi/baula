import express, { Router, NextFunction, Request, Response } from "express";
import { BadRequestError } from "../shared/error";
import { swaggerOptions, swaggerBaulaConfig, swaggerBilAppConfig } from '../config/swagger.config';
import swaggerUi from 'swagger-ui-express';
import { ensureAuthenticated } from "../shared/middleware/authentication-middleware";
import { baula } from "./baula/baula.router";
import { denyDemoWrites } from "../shared/middleware/demo-middleware";
import { bilapp } from "./bilapp/bilapp.router";
import { evaluation } from './evaluation/evaluation.router';
import mongoose from "mongoose";
import { redisClient } from "../config/session.config";

const router: Router = express.Router();

// Health check endpoint - no authentication required
router.get('/health', (req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = redisClient.isReady ? 'connected' : 'disconnected';
  
  const healthStatus = {
    status: mongoStatus === 'connected' && redisStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
    environment: process.env.NODE_ENV || 'development',
  };
  
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Remove duplicate express.json() - already set in app.ts
// router.use(express.json());

router.get("/", ensureAuthenticated, (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        res.status(200).json({ user: req.user })
    } else {
        next(new BadRequestError())
    }
})

// use swagger for api docs
router.use('/docs/baula', swaggerUi.serveFiles(swaggerBaulaConfig, swaggerOptions), swaggerUi.setup(swaggerBaulaConfig));
router.use('/docs/bilapp', swaggerUi.serveFiles(swaggerBilAppConfig, swaggerOptions), swaggerUi.setup(swaggerBilAppConfig));

// API Versioning: v1 routes
// Note: Current routes are mounted at /api/v1/... for versioning
// Backwards compatibility: also mount at /api/... (deprecated)
router.use('/v1/baula', ensureAuthenticated, denyDemoWrites, baula);
router.use('/v1/bilapp', bilapp);
router.use('/v1/evaluation', ensureAuthenticated, denyDemoWrites, evaluation);

// Backwards compatibility: old routes without versioning
// These will be deprecated in future versions
router.use('/baula', ensureAuthenticated, denyDemoWrites, (req, res, next) => {
  console.warn('[DEPRECATION] /api/baula is deprecated. Use /api/v1/baula instead.');
  next();
}, baula);
router.use('/bilapp', (req, res, next) => {
  console.warn('[DEPRECATION] /api/bilapp is deprecated. Use /api/v1/bilapp instead.');
  next();
}, bilapp);
router.use('/evaluation', ensureAuthenticated, denyDemoWrites, (req, res, next) => {
  console.warn('[DEPRECATION] /api/evaluation is deprecated. Use /api/v1/evaluation instead.');
  next();
}, evaluation);

export { router as api };
