import express, { Router, NextFunction, Request, Response } from "express";
import { BadRequestError } from "../shared/error";
import { swaggerConfig } from '../config/swagger.config';
import swaggerUi from 'swagger-ui-express';
import { ensureAuthenticated } from "../shared/middleware/authenticationMiddleware";

const router: Router = express.Router();
router.use(express.json());

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        res.status(200).json({ user: req.user })
    } else {
        next(new BadRequestError())
    }
})

router.use(ensureAuthenticated)

// use swagger for api docs
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

// for classic routing define namespaces and include routes
import { courses } from "./courses/courses.router";
router.use("/courses", courses);

import { studyprogrammes } from "./studyprogrammes/studyprogrammes.router";
router.use("/studyprogrammes", studyprogrammes);

import { studyplan } from "./studyplans/studyplans.router";
router.use("/studyplan", studyplan);

import { mhbs } from "./mhbs/mhbs.router";
router.use("/mhbs", mhbs);

import { competences } from './competences/competences.router';
router.use('/competences', competences);

import { user } from "./user/user.router";
router.use("/user", user);

import { semesterplans } from "./semesterplans/semesterplans.router";
router.use("/semesterplan", semesterplans); // TODO semesterplans + in RestService too

import { meta } from "./meta/meta.router";
router.use("/meta", meta);

import { recs } from './recs/recs.router';
router.use('/recs', recs);

import { admin } from "./admin/admin.router";
import { checkAndReturnAdminUser } from "../shared/middleware/adminMiddleware";
router.use('/admin', checkAndReturnAdminUser, admin);

import { jobproposal } from './jobproposal/jobproposal.router';
router.use('/job-proposal', jobproposal);

import { evaluation } from './evaluation/evaluation.router';
router.use('/evaluation', evaluation);

import { survey } from "./survey/survey.router";
router.use('/survey', survey);

export { router as api };
