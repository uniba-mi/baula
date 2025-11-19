import express, { Router, NextFunction, Request, Response } from "express";
import { BadRequestError } from "../shared/error";
import { swaggerOptions, swaggerBaulaConfig, swaggerBilAppConfig } from '../config/swagger.config';
import swaggerUi from 'swagger-ui-express';
import { ensureAuthenticated } from "../shared/middleware/authentication-middleware";
import { baula } from "./baula/baula.router";
import { denyDemoWrites } from "../shared/middleware/demo-middleware";
import { bilapp } from "./bilapp/bilapp.router";
import { evaluation } from './evaluation/evaluation.router';

const router: Router = express.Router();

router.use(express.json());

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

router.use('/baula', ensureAuthenticated, denyDemoWrites, baula);
router.use('/bilapp', bilapp)
router.use('/evaluation', ensureAuthenticated, denyDemoWrites, evaluation);

export { router as api };
