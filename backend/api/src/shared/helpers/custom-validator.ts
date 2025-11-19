import mongoose from "mongoose";
import { UserGeneratedModule } from "../../../../../interfaces/user-generated-module";
import {
  PlanCourse,
  SemesterPlan,
  SemesterPlanTemplate,
} from "../../../../../interfaces/semester-plan";
import { StudyPlanTemplate } from "../../../../../interfaces/study-plan";
import { Hint, UserServer } from "../../../../../interfaces/user";
import validator from "validator";
import { Jobtemplate } from "../../../../../interfaces/job";
import { LongTermEvaluation } from "../../../../../interfaces/long-term-evaluation";

const {
  Types: { ObjectId },
} = mongoose;

// check if mongodbid is valid
// https://stackoverflow.com/questions/69848632/how-to-check-for-a-valid-object-id-in-mongoose
export const validateObjectId = (id: string) =>
  ObjectId.isValid(id) && new ObjectId(id).toString() === id; //true or false

export const validateAndReturnSemesterPlanTemplate = (
  sp: any
): SemesterPlanTemplate | undefined => {
  return sp && sp.semester && sp.courses ? sp : undefined;
};

export const validateAndReturnCourse = (
  course: any
): PlanCourse | undefined => {
  return course &&
    course.id &&
    typeof course.status == "string" &&
    validator.isAlpha(course.status) &&
    course.contributeTo !== undefined
    ? course
    : undefined;
};

export const validateAndReturnUserGeneratedModule = (
  module: any
): UserGeneratedModule | undefined => {
  return module &&
    typeof module.name == "string" &&
    module.name.length <= 50 &&
    validator.matches(module.name, /[a-zA-Z0-9\s?.,&:]*/g) &&
    validator.isInt(String(module.ects), { min: 0, max: 30 }) &&
    (!module.notes ||
      (typeof module.notes == "string" &&
        module.notes.length <= 1000 &&
        validator.matches(module.notes, /[a-zA-Z0-9\s?.,&:]*/g)))
    ? module
    : undefined;
};

export const validateAndReturnSemesterPlan = (
  sp: any
): SemesterPlan | undefined => {
  return sp &&
    sp.semester &&
    typeof sp.semester == "string" &&
    validator.matches(sp.semester, /\d{4}((w)|(s))/g) &&
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

export const validateAndReturnUser = (user: any): UserServer | undefined => {
  return user &&
    typeof user.shibId == "string" &&
    user.shibId.length == 32 &&
    Array.isArray(user.roles) &&
    user.roles.length !== 0 &&
    validator.matches(String(user.startSemester), /\d{4}((w)|(s))/g) &&
    validator.isInt(String(user.duration), { min: 3, max: 20 }) &&
    validator.isInt(String(user.maxEcts), { min: 1, max: 300 }) &&
    Array.isArray(user.completedModules) &&
    Array.isArray(user.sps) &&
    validator.isBoolean(user.fulltime.toString()) &&
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

export const validateAndReturnStudyPlan = (
  studyPlan: any
): StudyPlanTemplate | undefined => {
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
const isValidHint = (hint: any): hint is Hint => {
  return typeof hint.key === "string" && typeof hint.hasConfirmed === "boolean";
};

// Validate as an array of Hint
export const validateAndReturnHints = (hints: any[]): Hint[] | undefined => {
  if (!Array.isArray(hints) || hints.some((hint) => !isValidHint(hint))) {
    return undefined;
  }
  return hints as Hint[];
};

export const validateAndReturnSemester = (
  semester: string
): string | undefined => {
  if (validator.matches(String(semester), /\d{4}((w)|(s))/g)) {
    return semester;
  } else {
    return;
  }
};

export const validateAndReturnJobtemplate = (
  job: any
): Jobtemplate | undefined => {
  return job &&
    job.title &&
    job.description &&
    job.inputMode &&
    (job.inputMode === "url" || job.inputMode === "mock") &&
    job.keywords &&
    Array.isArray(job.keywords) &&
    job.keywords.every((keyword: string) =>
      validator.isAlphanumeric(keyword, undefined, {
        ignore: " .#+|()&:/ß _-äöü",
      })
    )
    ? {
        ...job,
        title: job.title,
        description: job.description,
        inputMode: job.inputMode,
      }
    : undefined;
};

export const validateAndReturnSurveyResult = (
  result: any
): LongTermEvaluation | undefined => {
  return result &&
    result.personalCode &&
    result.personalCode.length == 8 &&
    result.evaluationCode &&
    validator.matches(result.evaluationCode, /\d{1,2}-20\d{2}/) &&
    result.spName &&
    validator.isAscii(result.spName) &&
    result.semester &&
    validator.isInt(String(result.semester), { min: 0, max: 20 }) &&
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
