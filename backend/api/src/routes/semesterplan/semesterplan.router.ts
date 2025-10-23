import express, { Router } from 'express';
import {
    addCourse,
    deleteCourse,
    getAllSavedCourses,
    createUserGeneratedModule,
    addModule,
    updateUserGeneratedModule,
    deleteUserGeneratedModule,
    deleteModule,
    updateSemesterplanAimedEcts,
    initSemesterplans,
    updateIsPastSemester,
    importSemesterplan,
    addCourses,
    deleteCourses,
    addSemesterplanToStudyplan,
    deleteUserGeneratedModules
} from './semesterplan.controller';

//using router to forward request
const router: Router = express.Router();
//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());

// get courses from all semesterplans
router.get("/courses", getAllSavedCourses);

// #############################
// GENERAL SEMESTERPLAN REQUESTS
// #############################

/** ------------------------------------
 *  Creates semesterplans for specific studyplan
 *  @param studyplanId contains _id of studyplan
 *  @param semesterPlans contains semesterplans
 *  @returns created semesterplans
 *  ------------------------------------ */
router.post("/init", initSemesterplans);

/** ------------------------------------
 *  Gets a semesterplan and adds it to a studyplan (at the end of)
 *  @param studyplanId contains _id of studyplan
 *  @param semester of the plan that should be created
 *  @returns created semesterplans
 */
router.post("/", addSemesterplanToStudyplan);

/** -----------------------------------------
 * Replaces existing semesterplan with imported semesterplan
 * @param semesterplan as type of SemesterplanTemplate
 * @param semester of the imported semesterplan
 * -----------------------------------------*/
router.put("/", importSemesterplan);

/** ----------------------------------------
 * Updates aimedECTS of Study semesterplan
 * @param studyplanId
 * @param semesterplanId
 * @param aimedEcts
 *  ---------------------------------------- */
router.put("/aimed-ects", updateSemesterplanAimedEcts);

/** ----------------------------------------
* Updates isPastSemester property of semesterplan
* @param studyplanId
* @param semesterplanId
* @param isPast
*  ---------------------------------------- */
router.put("/is-past-semester", updateIsPastSemester);

// ########################
// COURSE SPECIFIC REQUESTS
// ########################

router.post("/course", addCourse);

router.post("/courses", addCourses);

router.delete("/course", deleteCourse);

router.delete("/courses", deleteCourses);

// ########################
// MODULE SPECIFIC REQUESTS
// ########################

/**
 * Adds a new module to the studyplan
 * @param studyplanId
 * @param semesterplanId
 * @param module
 * @param ects
 */
router.post("/module", addModule);

/**
 * @param studyplanId
 * @param semesterplanId
 * @param module
 */
router.post("/user-generated-module", createUserGeneratedModule);

/** ----------------------------------------
 * Updates user generated module of Study semesterplan
 * @param studyplanId
 * @param semesterplanId
 * @param module
 *  ---------------------------------------- */
router.put("/user-generated-module", updateUserGeneratedModule);

router.delete("/module", deleteModule);

router.delete("/user-generated-module", deleteUserGeneratedModule);

router.delete("/user-generated-modules", deleteUserGeneratedModules);

export { router as semesterplan }