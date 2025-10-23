 import express, { Router, NextFunction, Request, Response } from "express";
import { BadRequestError } from "../shared/error";
import { ensureAuthenticated } from "../shared/middleware/authenticationMiddleware";

const router: Router = express.Router();
router.use(express.json());

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    if(req.user) {
        res.status(200).json({ user: req.user })
    } else {
        next(new BadRequestError())
    }   
})

router.use(ensureAuthenticated)

//for classic routing define namespaces and include routes
import { univis } from "./univis/univis.router";
router.use("/univis", univis);

import { studyprogramme } from "./studyprogramme/studyprogramme.router";
router.use("/studyprogramme", studyprogramme);

import { studyplan } from "./studyplans/studyplans.router";
router.use("/studyplan", studyplan);

import { mhb } from "./mhb/mhb.router";
router.use("/mhb", mhb);

import { competences } from './competences/competences.router';
router.use('/competences', competences);

import { user } from "./user/user.router";
router.use("/user", user);

import { semesterplan } from "./semesterplan/semesterplan.router";
router.use("/semesterplan", semesterplan);

import { meta } from "./meta/meta.router";
router.use("/meta", meta);

import { recs } from './recs/recs.router';
router.use('/recs', recs);

import { admin } from "./admin/admin.router";
import { checkAndReturnAdminUser } from "../shared/middleware/adminMiddleware";
router.use('/admin', checkAndReturnAdminUser, admin);

import { jobproposal } from './jobproposal/jobproposal.router';
router.use('/job-proposal', jobproposal);

export { router as api };
