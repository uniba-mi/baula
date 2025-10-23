import express, { Router } from "express";
import { 
    getMhbByIdAndVersion, 
    getModByAcronymAndVersion,
    getAllModules,
    getAllCurrentModules
} from './mhb.controller';

const router: Router = express.Router();

// get mod from id and version
router.get('/module/:acronym/:version', getModByAcronymAndVersion);

// get all modules
router.get('/modules', getAllModules);

// get all modules filtered with equivalence list
router.get('/current-modules', getAllCurrentModules);

// Get mhb-structure from specific id
router.get('/:id/:version', getMhbByIdAndVersion);

export { router as mhb };