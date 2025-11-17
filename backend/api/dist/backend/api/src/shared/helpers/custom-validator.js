"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndReturnSurveyResult = exports.validateAndReturnJobtemplate = exports.validateAndReturnSemester = exports.validateAndReturnHints = exports.validateAndReturnStudyPlan = exports.validateAndReturnUser = exports.validateAndReturnSemesterPlan = exports.validateAndReturnUserGeneratedModule = exports.validateAndReturnCourse = exports.validateAndReturnSemesterPlanTemplate = exports.validateObjectId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const { Types: { ObjectId }, } = mongoose_1.default;
// check if mongodbid is valid
// https://stackoverflow.com/questions/69848632/how-to-check-for-a-valid-object-id-in-mongoose
const validateObjectId = (id) => ObjectId.isValid(id) && new ObjectId(id).toString() === id; //true or false
exports.validateObjectId = validateObjectId;
const validateAndReturnSemesterPlanTemplate = (sp) => {
    return sp && sp.semester && sp.courses ? sp : undefined;
};
exports.validateAndReturnSemesterPlanTemplate = validateAndReturnSemesterPlanTemplate;
const validateAndReturnCourse = (course) => {
    return course &&
        course.id &&
        typeof course.status == "string" &&
        validator_1.default.isAlpha(course.status) &&
        course.contributeTo !== undefined
        ? course
        : undefined;
};
exports.validateAndReturnCourse = validateAndReturnCourse;
const validateAndReturnUserGeneratedModule = (module) => {
    return module &&
        typeof module.name == "string" &&
        module.name.length <= 50 &&
        validator_1.default.matches(module.name, /[a-zA-Z0-9\s?.,&:]*/g) &&
        validator_1.default.isInt(String(module.ects), { min: 0, max: 30 }) &&
        (!module.notes ||
            (typeof module.notes == "string" &&
                module.notes.length <= 1000 &&
                validator_1.default.matches(module.notes, /[a-zA-Z0-9\s?.,&:]*/g)))
        ? module
        : undefined;
};
exports.validateAndReturnUserGeneratedModule = validateAndReturnUserGeneratedModule;
const validateAndReturnSemesterPlan = (sp) => {
    return sp &&
        sp.semester &&
        typeof sp.semester == "string" &&
        validator_1.default.matches(sp.semester, /\d{4}((w)|(s))/g) &&
        sp.modules &&
        Array.isArray(sp.modules) &&
        sp.userGeneratedModules &&
        Array.isArray(sp.userGeneratedModules) &&
        typeof sp.summedEcts == "number" &&
        typeof sp.aimedEcts == "number" &&
        typeof sp.isPastSemester == "boolean"
        ? sp
        : undefined;
};
exports.validateAndReturnSemesterPlan = validateAndReturnSemesterPlan;
const validateAndReturnUser = (user) => {
    return user &&
        typeof user.shibId == "string" &&
        user.shibId.length == 32 &&
        Array.isArray(user.roles) &&
        user.roles.length !== 0 &&
        validator_1.default.matches(String(user.startSemester), /\d{4}((w)|(s))/g) &&
        validator_1.default.isInt(String(user.duration), { min: 3, max: 20 }) &&
        validator_1.default.isInt(String(user.maxEcts), { min: 1, max: 300 }) &&
        Array.isArray(user.completedModules) &&
        Array.isArray(user.sps) &&
        validator_1.default.isBoolean(user.fulltime.toString()) &&
        Array.isArray(user.hints) &&
        Array.isArray(user.topics) &&
        Array.isArray(user.consents) &&
        Array.isArray(user.jobs) &&
        Array.isArray(user.moduleFeedback) &&
        Array.isArray(user.favouriteModulesAcronyms) &&
        Array.isArray(user.excludedModulesAcronyms) &&
        Array.isArray(user.dashboardSettings) &&
        Array.isArray(user.timetableSettings)
        ? user
        : undefined;
};
exports.validateAndReturnUser = validateAndReturnUser;
const validateAndReturnStudyPlan = (studyPlan) => {
    return studyPlan &&
        "name" in studyPlan &&
        typeof studyPlan.name == "string" &&
        "status" in studyPlan &&
        typeof studyPlan.status == "boolean" &&
        "semesterPlans" in studyPlan &&
        Array.isArray(studyPlan.semesterPlans)
        ? studyPlan
        : undefined;
};
exports.validateAndReturnStudyPlan = validateAndReturnStudyPlan;
// currently not used
// const validateAndReturnUserGeneratedModules = (
//   modules: any[]
// ): UserGeneratedModule[] | undefined => {
//   for (let module of modules) {
//     if (!validateAndReturnUserGeneratedModule(module)) {
//       return undefined;
//     }
//   }
//   return modules;
// };
// Validation function for a single hint
// Check for single hint
const isValidHint = (hint) => {
    return typeof hint.key === "string" && typeof hint.hasConfirmed === "boolean";
};
// Validate as an array of Hint
const validateAndReturnHints = (hints) => {
    if (!Array.isArray(hints) || hints.some((hint) => !isValidHint(hint))) {
        return undefined;
    }
    return hints;
};
exports.validateAndReturnHints = validateAndReturnHints;
const validateAndReturnSemester = (semester) => {
    if (validator_1.default.matches(String(semester), /\d{4}((w)|(s))/g)) {
        return semester;
    }
    else {
        return;
    }
};
exports.validateAndReturnSemester = validateAndReturnSemester;
const validateAndReturnJobtemplate = (job) => {
    return job &&
        job.title &&
        job.description &&
        job.inputMode &&
        (job.inputMode === "url" || job.inputMode === "mock") &&
        job.keywords &&
        Array.isArray(job.keywords) &&
        job.keywords.every((keyword) => validator_1.default.isAlphanumeric(keyword, undefined, {
            ignore: " .#+|()&:/ß _-äöü",
        }))
        ? {
            ...job,
            title: job.title,
            description: job.description,
            inputMode: job.inputMode,
        }
        : undefined;
};
exports.validateAndReturnJobtemplate = validateAndReturnJobtemplate;
const validateAndReturnSurveyResult = (result) => {
    return result &&
        result.personalCode &&
        result.personalCode.length == 8 &&
        result.evaluationCode &&
        validator_1.default.matches(result.evaluationCode, /\d{1,2}-20\d{2}/) &&
        result.spName &&
        validator_1.default.isAscii(result.spName) &&
        result.semester &&
        validator_1.default.isInt(String(result.semester), { min: 0, max: 20 }) &&
        result.pu &&
        Array.isArray(result.pu) &&
        result.peou &&
        Array.isArray(result.peou) &&
        typeof result.bi == 'number' &&
        typeof result.use == 'string' &&
        typeof result.nps == 'number'
        ? result
        : undefined;
};
exports.validateAndReturnSurveyResult = validateAndReturnSurveyResult;
