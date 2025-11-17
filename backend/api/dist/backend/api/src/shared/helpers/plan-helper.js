"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveStudyPlan = exports.findStudyPlan = void 0;
exports.getLatestPlanFilename = getLatestPlanFilename;
exports.findMatchingModuleIndex = findMatchingModuleIndex;
const mongo_1 = require("../../database/mongo");
const semester_1 = require("../../../../../interfaces/semester");
const custom_validator_1 = require("./custom-validator");
const findStudyPlan = async (studyPlanId) => {
    if ((0, custom_validator_1.validateObjectId)(studyPlanId)) {
        return await mongo_1.StudyPlan.findById(studyPlanId).exec();
    }
    else {
        return undefined;
    }
};
exports.findStudyPlan = findStudyPlan;
const findActiveStudyPlan = async (uId) => {
    return await mongo_1.StudyPlan.findOne({
        $and: [{ userId: uId }, { status: true }],
    });
};
exports.findActiveStudyPlan = findActiveStudyPlan;
// Get the latest plan filename based on semester type
function getLatestPlanFilename(files, semesterType) {
    let latestPlanFilename;
    let latestSemester;
    files.forEach((file) => {
        const match = file.match(/-(\d{4})([sw])/);
        if (match) {
            const semesterName = `${match[1]}${match[2]}`;
            const semester = new semester_1.Semester(semesterName);
            if (semester.type === semesterType) {
                if (!latestSemester ||
                    semester.year > latestSemester.year ||
                    (semester.year === latestSemester.year &&
                        semester.type === latestSemester.type)) {
                    latestSemester = semester;
                    latestPlanFilename = file;
                }
            }
        }
    });
    return latestPlanFilename;
}
// helper  for finish semester - find matching module index
function findMatchingModuleIndex(userModules, module, moduleObjectId) {
    return userModules.findIndex((existingMod) => {
        // Case 1: Incoming module is NORMAL (!ug)
        if (!module.isUserGenerated) {
            // 1a: If matching ID, use this index
            if ((moduleObjectId === null || moduleObjectId === void 0 ? void 0 : moduleObjectId.toString()) &&
                existingMod._id &&
                moduleObjectId.toString() === existingMod._id.toString()) {
                return true;
            }
            // 1b: If NORMAL module with matching acronym in the semester, use this index
            if (!existingMod.isUserGenerated &&
                existingMod.acronym === module.acronym &&
                existingMod.semester === module.semester) {
                return true;
            }
            return false;
        }
        // Case 2: Incoming module is UG MOD (ug && !fn)
        if (module.isUserGenerated && !module.flexNowImported) {
            // 2a: If matching ID, use this index
            if ((moduleObjectId === null || moduleObjectId === void 0 ? void 0 : moduleObjectId.toString()) &&
                existingMod._id &&
                moduleObjectId.toString() === existingMod._id.toString()) {
                return true;
            }
            return false;
        }
        // Case 3: Incoming module is FN MOD (ug && fn)
        if (module.isUserGenerated && module.flexNowImported) {
            // 3a: If matching ID, use this index
            if ((moduleObjectId === null || moduleObjectId === void 0 ? void 0 : moduleObjectId.toString()) &&
                existingMod._id &&
                moduleObjectId.toString() === existingMod._id.toString()) {
                return true;
            }
            // 3b: If FN MOD with matching acronym in the semester, use this index
            if (existingMod.isUserGenerated &&
                existingMod.flexNowImported &&
                existingMod.acronym === module.acronym &&
                existingMod.semester === module.semester) {
                return true;
            }
            return false;
        }
        return false;
    });
}
