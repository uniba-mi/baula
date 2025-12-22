import express, { Router } from "express";

const router: Router = express.Router();
router.use(express.json());

// for classic routing define namespaces and include routes
import { courses } from "./courses/courses.router";
router.use("/courses", courses);

import { studyProgrammes } from "./study-programmes/study-programmes.router";
router.use("/study-programmes", studyProgrammes);

import { studyPlans } from "./study-plans/study-plans.router";
router.use("/study-plans", studyPlans);

import { moduleHandbooks } from "./module-handbooks/module-handbooks.router";
router.use("/module-handbooks", moduleHandbooks);

import { user } from "./user/user.router";
router.use("/user", user);

import { semesterPlans } from "./semester-plans/semester-plans.router";
router.use("/semester-plans", semesterPlans);

import { meta } from "./meta/meta.router";
router.use("/meta", meta);

import { recommendations } from './recommendations/recommendations.router';
router.use('/recommendations', recommendations);

import { jobs } from './jobs/jobs.router';
router.use('/jobs', jobs);

import { topics } from "./topics/topics.router";
router.use('/topics', topics);

import { feedback } from "./feedback/feedback.router";
router.use('/feedback', feedback);

import { admin } from "./admin/admin.router";
import { checkAndReturnAdminUser } from "../../shared/middleware/admin-middleware";
router.use('/admin', checkAndReturnAdminUser, admin);

import { survey } from "./survey/survey.router";
router.use('/survey', survey);

export { router as baula };