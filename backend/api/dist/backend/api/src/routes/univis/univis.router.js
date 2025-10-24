"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.univis = void 0;
const express_1 = __importDefault(require("express"));
const univis_controller_1 = require("./univis.controller");
const router = express_1.default.Router();
exports.univis = router;
//false: only support simple bodys, true would support rich data
router.use(express_1.default.urlencoded({ extended: false }));
//json data will be extracted
router.use(express_1.default.json());
// get details of single course
router.get("/course/:id/:semester", univis_controller_1.getCourseDetails);
// get top n courses of those who fulfill given competencegroup the most for given semester
router.get("/courses/:semester/:competence/:topN", univis_controller_1.getTopNCoursesForCompetence);
// get courses with specific search term (e.g. LAMOD-01 for all EWS-Courses)
router.get("/courses/:semester/:searchTerm", univis_controller_1.getSpecificCourses);
// perform search query on courses
router.get("/courses/:semester", univis_controller_1.getCoursesOfSemester);
