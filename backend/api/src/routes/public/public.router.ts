import express, { Router } from "express";
import { getAllLowerCompetences, getAllStandards } from "../competences/competences.controller";
import { getBilAppCourses, getCompetenceAndModulesOfCourse, getUniqueModules } from "./public.controller";

const router: Router = express.Router();

// Get mhb-structure from specific id
router.get('/modules', getUniqueModules);

// Add a xml file containing module structure into the database
router.get('/competences', getAllLowerCompetences);

// get mod from id and version
router.get('/standards', getAllStandards);

// get all courses from Bilapp
router.get('/courses/:semester', getBilAppCourses);

// get competence and module connection of course
router.get('/course/:id', getCompetenceAndModulesOfCourse);

export { router as formdata };