import express, { Router } from "express";
import { getResults, saveResult } from "./survey.controller";
import { checkAndReturnAdminUser } from "../../../shared/middleware/admin-middleware";

const router: Router = express.Router();
router.use(express.json());

// save result to database
router.post('/', saveResult); 

// get statistics for reporting in admin area
router.get('/report', checkAndReturnAdminUser, getResults);


export { router as survey };
