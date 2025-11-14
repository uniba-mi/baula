import express, { Router } from "express";
import { resetConsentResponse, saveResult } from "./survey.controller";
import { checkAndReturnAdminUser } from "../../../shared/middleware/admin-middleware";

const router: Router = express.Router();
router.use(express.json());

// save result to database
router.post('/', saveResult); 

// resets all survey consenst to hasResponded = false
router.put('/reset/response', checkAndReturnAdminUser, resetConsentResponse)

export { router as survey };
