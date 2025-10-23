import express, { Router } from "express";
import {
  getCourseDetails,
  getSpecificCourses,
  getTopNCoursesForCompetence,
  getCoursesOfSemester,
} from "./univis.controller";

const router: Router = express.Router();
//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());

// get details of single course
router.get("/course/:id/:semester", getCourseDetails);

// get top n courses of those who fulfill given competencegroup the most for given semester
router.get("/courses/:semester/:competence/:topN", getTopNCoursesForCompetence);

// get courses with specific search term (e.g. LAMOD-01 for all EWS-Courses)
router.get("/courses/:semester/:searchTerm", getSpecificCourses);

// perform search query on courses
router.get("/courses/:semester", getCoursesOfSemester);

export { router as univis };
