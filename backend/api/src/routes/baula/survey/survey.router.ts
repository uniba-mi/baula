import express, { Router } from "express";
import { getResults, resetConsentResponse, saveResult } from "./survey.controller";
import { checkAndReturnAdminUser } from "../../../shared/middleware/admin-middleware";

const router: Router = express.Router();
router.use(express.json());

// save result to database
router.post('/', saveResult); 

// resets all survey consenst to hasResponded = false
router.put('/reset/response', checkAndReturnAdminUser, resetConsentResponse)

// get statistics for reporting in admin area
router.get('/report', getResults);


export { router as survey };
