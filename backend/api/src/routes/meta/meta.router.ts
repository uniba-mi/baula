import express, { Router } from 'express';
import {
    getDistinctDepartments,
    getDistinctCourseTypes
} from './meta.controller';

const router: Router = express.Router();
router.use(express.json())

// Get Departments
router.get('/departments', getDistinctDepartments);

// Get Course Types
router.get('/course-types', getDistinctCourseTypes);

export { router as meta };