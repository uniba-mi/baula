"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserGeneratedModule = createUserGeneratedModule;
exports.addModule = addModule;
exports.updateUserGeneratedModule = updateUserGeneratedModule;
exports.initSemesterPlans = initSemesterPlans;
exports.addSemesterPlanToStudyPlan = addSemesterPlanToStudyPlan;
exports.updateSemesterPlanAimedEcts = updateSemesterPlanAimedEcts;
exports.updateIsPastSemester = updateIsPastSemester;
exports.deleteModule = deleteModule;
exports.deleteUserGeneratedModule = deleteUserGeneratedModule;
exports.deleteUserGeneratedModules = deleteUserGeneratedModules;
exports.addCourse = addCourse;
exports.deleteCourse = deleteCourse;
exports.addCourses = addCourses;
exports.deleteCourses = deleteCourses;
exports.importSemesterPlan = importSemesterPlan;
const mongo_1 = require("../../../database/mongo");
const custom_validator_1 = require("../../../shared/helpers/custom-validator");
const validator_1 = __importDefault(require("validator"));
const error_1 = require("../../../shared/error");
const client_1 = require("@prisma/client");
const logger_1 = require("../../../shared/utils/logger");
const plan_helper_1 = require("../../../shared/helpers/plan-helper");
const prisma = new client_1.PrismaClient();
async function createUserGeneratedModule(req, res, next) {
    var _a, _b;
    const studyPlanId = (_b = (_a = req.body.studyPlanId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : undefined;
    const semesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.semesterPlanId)
        ? req.body.semesterPlanId
        : undefined;
    const module = (0, custom_validator_1.validateAndReturnUserGeneratedModule)(req.body.module);
    const ects = module && module.ects ? Number(module.ects) : 0;
    const studyPlan = await (0, plan_helper_1.findStudyPlan)(studyPlanId);
    if (studyPlan && semesterPlanId && module) {
        const semesterPlan = studyPlan.semesterPlans.find((el) => el._id == semesterPlanId);
        if (semesterPlan && semesterPlan.userGeneratedModules) {
            try {
                const newModuleIndex = semesterPlan.userGeneratedModules.push(module);
                semesterPlan.summedEcts += ects;
                await studyPlan.save();
                res
                    .status(200)
                    .json(semesterPlan.userGeneratedModules[newModuleIndex - 1]);
            }
            catch (error) {
                logger_1.logger.error(error);
                next(new error_1.BadRequestError());
            }
        }
        else {
            next(new error_1.NotFoundError("Für die angegebenen Daten konnte kein Semesterplan gefunden werden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
// Hier jetzt Versuch mit findOneAndUpdate statt await study plan save
async function addModule(req, res, next) {
    const studyPlanId = typeof req.body.studyPlanId === "string" ? req.body.studyPlanId : undefined;
    const semesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.semesterPlanId)
        ? req.body.semesterPlanId
        : undefined;
    const mod = typeof req.body.module === "string" &&
        validator_1.default.isAlphanumeric(req.body.module, "de-DE", { ignore: "- ." })
        ? req.body.module
        : undefined;
    const ects = !Number.isNaN(Number(req.body.ects)) ? Number(req.body.ects) : 0;
    if (studyPlanId && semesterPlanId && mod) {
        try {
            const updatedStudyPlan = await mongo_1.StudyPlan.findOneAndUpdate({ _id: studyPlanId, "semesterPlans._id": semesterPlanId }, {
                $push: { "semesterPlans.$.modules": mod },
                $inc: { "semesterPlans.$.summedEcts": ects },
            }, { new: true, runValidators: true });
            if (updatedStudyPlan) {
                const updatedSemesterPlan = updatedStudyPlan.semesterPlans.find((el) => el._id.toString() === semesterPlanId);
                if (updatedSemesterPlan) {
                    res
                        .status(200)
                        .json(updatedSemesterPlan === null || updatedSemesterPlan === void 0 ? void 0 : updatedSemesterPlan.modules[updatedSemesterPlan.modules.length - 1]);
                }
                else {
                    next(new error_1.NotFoundError("Semesterplan konnte im Studienplan nicht gefunden werden."));
                }
            }
            else {
                next(new error_1.NotFoundError("Für die angegebenen Daten konnte kein Semesterplan gefunden werden."));
            }
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(error);
        }
    }
    else {
        next(new error_1.BadRequestError("Invalid input data."));
    }
}
async function updateUserGeneratedModule(req, res, next) {
    const studyPlanId = typeof req.body.studyPlanId === "string" ? req.body.studyPlanId : undefined;
    const semesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.semesterPlanId)
        ? req.body.semesterPlanId
        : undefined;
    const moduleId = (0, custom_validator_1.validateObjectId)(req.body.moduleId)
        ? req.body.moduleId
        : undefined;
    const module = (0, custom_validator_1.validateAndReturnUserGeneratedModule)(req.body.module);
    if (!studyPlanId || !semesterPlanId || !module || !moduleId) {
        return next(new error_1.BadRequestError("Ungültige Inputs"));
    }
    try {
        const studyPlan = await mongo_1.StudyPlan.findOne({
            _id: studyPlanId,
            "semesterPlans._id": semesterPlanId,
            "semesterPlans.userGeneratedModules._id": moduleId,
        }, { "semesterPlans.$": 1 });
        if (!studyPlan) {
            return next(new error_1.NotFoundError("Studienplan wurde nicht gefunden."));
        }
        const semesterPlan = studyPlan.semesterPlans.find((el) => el._id.toString() === semesterPlanId);
        if (!semesterPlan) {
            return next(new error_1.NotFoundError("Semesterplan wurde nicht gefunden."));
        }
        const moduleToUpdate = semesterPlan.userGeneratedModules.find((el) => el._id.toString() === moduleId);
        if (!moduleToUpdate) {
            return next(new error_1.NotFoundError("Modul wurde nicht gefunden."));
        }
        const newSummedEcts = semesterPlan.summedEcts - moduleToUpdate.ects + module.ects;
        const updatedStudyPlan = await mongo_1.StudyPlan.findOneAndUpdate({
            _id: studyPlanId,
            "semesterPlans._id": semesterPlanId,
            "semesterPlans.userGeneratedModules._id": moduleId,
        }, {
            $set: {
                "semesterPlans.$[semesterPlan].userGeneratedModules.$[module].ects": module.ects,
                "semesterPlans.$[semesterPlan].userGeneratedModules.$[module].name": module.name,
                "semesterPlans.$[semesterPlan].userGeneratedModules.$[module].notes": module.notes,
                "semesterPlans.$[semesterPlan].summedEcts": newSummedEcts,
            },
        }, {
            new: true,
            arrayFilters: [
                { "semesterPlan._id": semesterPlanId },
                { "module._id": moduleId },
            ],
            runValidators: true,
        });
        if (!updatedStudyPlan) {
            return next(new error_1.NotFoundError("Semesterplan wurde im Studienplan nicht gefunden."));
        }
        const updatedSemesterPlan = updatedStudyPlan.semesterPlans.find((el) => el._id.toString() === semesterPlanId);
        const updatedModule = updatedSemesterPlan === null || updatedSemesterPlan === void 0 ? void 0 : updatedSemesterPlan.userGeneratedModules.find((el) => el._id.toString() === moduleId);
        res.status(200).json(updatedModule);
    }
    catch (error) {
        next(error);
    }
}
async function initSemesterPlans(req, res, next) {
    const id = typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
    const semesterPlans = req.body.semesterPlans;
    const studyPlan = await (0, plan_helper_1.findStudyPlan)(id);
    const user = req.user;
    if (Array.isArray(semesterPlans) && studyPlan && user) {
        for (let semesterPlan of semesterPlans) {
            // check if userId is set correctly otherwise set it
            semesterPlan.userId = semesterPlan.userId ? semesterPlan.userId : user._id;
            const validatedSemesterPlan = (0, custom_validator_1.validateAndReturnSemesterPlan)(semesterPlan);
            if (validatedSemesterPlan) {
                studyPlan.semesterPlans.push(validatedSemesterPlan);
            }
        }
        await studyPlan.save();
        res.status(200).json(studyPlan.semesterPlans);
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function addSemesterPlanToStudyPlan(req, res, next) {
    const user = req.user;
    const spId = typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    if (spId && user._id && semester) {
        const studyPlan = await (0, plan_helper_1.findStudyPlan)(spId);
        if (studyPlan) {
            try {
                const newSemesterPlan = {
                    modules: [],
                    userGeneratedModules: [],
                    courses: [],
                    userId: user._id,
                    semester: semester,
                    isPastSemester: false,
                    aimedEcts: 0,
                    summedEcts: 0,
                };
                studyPlan.semesterPlans.push(newSemesterPlan);
                await studyPlan.save();
                res.status(200).json(studyPlan);
            }
            catch (error) {
                next(new error_1.BadRequestError());
            }
        }
        else {
            next(new error_1.NotFoundError("Es konnte kein Studienplan gefunden werden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function updateSemesterPlanAimedEcts(req, res, next) {
    const spId = typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
    const semesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.semesterPlanId)
        ? req.body.semesterPlanId
        : undefined;
    const aimedEcts = req.body.aimedEcts &&
        validator_1.default.isInt(String(req.body.aimedEcts), { min: 0, max: 210 })
        ? Number(req.body.aimedEcts)
        : undefined;
    const studyPlan = await (0, plan_helper_1.findStudyPlan)(spId);
    if (studyPlan && semesterPlanId && aimedEcts) {
        const semesterPlan = studyPlan.semesterPlans.find((el) => el._id == semesterPlanId);
        if (semesterPlan && semesterPlan.aimedEcts !== undefined) {
            semesterPlan.aimedEcts = aimedEcts;
            await studyPlan.save();
            res.status(200).json(semesterPlan);
        }
        else {
            next(new error_1.NotFoundError("Es konnte kein passender Datensatz gefunden werden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function updateIsPastSemester(req, res, next) {
    const spId = typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
    const semesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.semesterPlanId)
        ? req.body.semesterPlanId
        : undefined;
    const isPast = Boolean(req.body.isPast);
    const studyPlan = await (0, plan_helper_1.findStudyPlan)(spId);
    if (studyPlan && semesterPlanId && isPast) {
        const semesterPlan = studyPlan.semesterPlans.find((el) => el._id == semesterPlanId);
        if (semesterPlan) {
            try {
                semesterPlan.isPastSemester = isPast;
                await studyPlan.save();
                res.status(200).json(semesterPlan);
            }
            catch (error) {
                next(new error_1.BadRequestError());
            }
        }
        else {
            next(new error_1.NotFoundError("Es konnte kein passender Datensatz gefunden werden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function deleteModule(req, res, next) {
    const studyPlanId = typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
    const semesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.semesterPlanId)
        ? req.body.semesterPlanId
        : undefined;
    const mod = typeof req.body.module == "string" ? req.body.module : undefined;
    const ects = !Number.isNaN(Number(req.body.ects))
        ? Number(req.body.ects)
        : undefined;
    const studyPlan = await (0, plan_helper_1.findStudyPlan)(studyPlanId);
    if (studyPlan && semesterPlanId && mod && ects) {
        const semesterPlan = studyPlan.semesterPlans.find((el) => el._id == semesterPlanId);
        if (semesterPlan) {
            const index = semesterPlan.modules.findIndex((el) => el == mod);
            if (index !== -1) {
                const deleted = semesterPlan.modules.splice(index, 1);
                semesterPlan.summedEcts -= ects;
                // TODO: Hier tritt ein Fehler auf, wenn man ein Modul zwischen Semestern hin und her verschiebt, vermutlich weil das Hinzufügen und Löschen beide auf den study plan zugreifen.
                await studyPlan.save();
                res.status(200).json(deleted);
            }
            else {
                next(new error_1.NotFoundError("Da angefragte Modul kann nicht gelöscht werden."));
            }
        }
        else {
            next(new error_1.NotFoundError("Es konnte kein passender Semesterplan gefunden werden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function deleteUserGeneratedModule(req, res, next) {
    const studyPlanId = typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
    const semesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.semesterPlanId)
        ? req.body.semesterPlanId
        : undefined;
    const module = (0, custom_validator_1.validateAndReturnUserGeneratedModule)(req.body.module);
    const studyPlan = await (0, plan_helper_1.findStudyPlan)(studyPlanId);
    if (studyPlan && semesterPlanId && module) {
        const semesterPlan = studyPlan.semesterPlans.find((el) => el._id == semesterPlanId);
        if (semesterPlan && semesterPlan.userGeneratedModules) {
            const index = semesterPlan.userGeneratedModules.findIndex((el) => el._id == module._id);
            if (index !== -1) {
                const deleted = semesterPlan.userGeneratedModules.splice(index, 1);
                semesterPlan.summedEcts -= module.ects;
                await studyPlan.save();
                res.status(200).json(deleted);
            }
            else {
                next(new error_1.NotFoundError("Es konnte kein passender Semesterplan gefunden werden."));
            }
        }
        else {
            next(new error_1.NotFoundError("Es konnte kein passender Semesterplan gefunden werden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function deleteUserGeneratedModules(req, res, next) {
    const studyPlanId = typeof req.body.studyPlanId == "string" ? req.body.studyPlanId : undefined;
    const semesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.semesterPlanId)
        ? req.body.semesterPlanId
        : undefined;
    const moduleIds = Array.isArray(req.body.moduleIds)
        ? req.body.moduleIds
        : [];
    const studyPlan = await (0, plan_helper_1.findStudyPlan)(studyPlanId);
    if (studyPlan && semesterPlanId && moduleIds.length > 0) {
        const semesterPlan = studyPlan.semesterPlans.find((el) => el._id == semesterPlanId);
        if (semesterPlan && semesterPlan.userGeneratedModules) {
            const deletedModules = [];
            moduleIds.forEach((moduleId) => {
                const index = semesterPlan.userGeneratedModules.findIndex((el) => el._id == moduleId);
                if (index !== -1) {
                    const [deleted] = semesterPlan.userGeneratedModules.splice(index, 1);
                    semesterPlan.summedEcts -= deleted.ects;
                    deletedModules.push(deleted);
                }
            });
            if (deletedModules.length > 0) {
                await studyPlan.save();
                res.status(200).json(deletedModules);
            }
            else {
                next(new error_1.NotFoundError("Keine Module gefunden."));
            }
        }
        else {
            next(new error_1.NotFoundError("Kein Semesterplan gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
// add course to semester plan
async function addCourse(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const course = (0, custom_validator_1.validateAndReturnCourse)(req.body.course);
    const isPastSemester = Boolean(req.body.isPastSemester);
    const user = req.user;
    if (semester && course && user._id) {
        const studyPlan = await (0, plan_helper_1.findActiveStudyPlan)(user._id);
        if (studyPlan) {
            // find semester plan
            const semesterPlan = studyPlan.semesterPlans.find((el) => el.semester === semester);
            if (semesterPlan && semesterPlan.courses) {
                semesterPlan.courses.push(course);
                semesterPlan.isPastSemester = isPastSemester;
                try {
                    await studyPlan.save();
                    res.status(200).json(semesterPlan.courses);
                }
                catch (error) {
                    next(new error_1.BadRequestError());
                }
            }
            else {
                next(new error_1.NotFoundError("Keinen passenden Semesterplan gefunden."));
            }
        }
        else {
            next(new error_1.NotFoundError("Keinen passenden Studienplan gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
// delete course from semester plan
async function deleteCourse(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const courseId = req.body.courseId;
    const user = req.user;
    if (semester && courseId && user._id) {
        const studyPlan = await (0, plan_helper_1.findActiveStudyPlan)(user._id);
        if (studyPlan) {
            // find semester plan
            const semplan = studyPlan.semesterPlans.find((el) => el.semester === semester);
            if (semplan) {
                const index = semplan.courses.findIndex((el) => el.id == courseId);
                semplan.courses.splice(index, 1);
                try {
                    await studyPlan.save();
                    res.status(200).json(semplan.courses);
                }
                catch (error) {
                    next(new error_1.BadRequestError());
                }
            }
            else {
                next(new error_1.NotFoundError("Keinen Eintrag gefunden."));
            }
        }
        else {
            next(new error_1.NotFoundError("Keinen passenden Studienplan gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
// Add multiple courses to semester plan
async function addCourses(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const courses = Array.isArray(req.body.courses)
        ? req.body.courses.map(custom_validator_1.validateAndReturnCourse).filter(Boolean)
        : [];
    const isPastSemester = Boolean(req.body.isPastSemester);
    const user = req.user;
    if (semester && courses.length > 0 && user._id) {
        const studyPlan = await (0, plan_helper_1.findActiveStudyPlan)(user._id);
        if (studyPlan) {
            const semplan = studyPlan.semesterPlans.find((el) => el.semester === semester);
            if (semplan && semplan.courses) {
                // filter courses that are already in the plan
                const existingCourseIds = semplan.courses.map((course) => course.id);
                const newCourses = courses.filter((course) => !existingCourseIds.includes(course.id));
                if (newCourses.length > 0) {
                    semplan.courses.push(...newCourses);
                }
                semplan.isPastSemester = isPastSemester;
                try {
                    await studyPlan.save();
                    res.status(200).json(semplan.courses);
                }
                catch (error) {
                    next(new error_1.BadRequestError());
                }
            }
            else {
                next(new error_1.NotFoundError("Keinen passenden Semesterplan gefunden."));
            }
        }
        else {
            next(new error_1.NotFoundError("Keinen passenden Studienplan gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
// Remove multiple courses from semester plan
async function deleteCourses(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const courseIds = Array.isArray(req.body.courseIds) ? req.body.courseIds : [];
    const user = req.user;
    if (semester && courseIds.length > 0 && user._id) {
        const studyPlan = await (0, plan_helper_1.findActiveStudyPlan)(user._id);
        if (studyPlan) {
            const semplan = studyPlan.semesterPlans.find((el) => el.semester === semester);
            if (semplan && semplan.courses) {
                semplan.courses = semplan.courses.filter((course) => !courseIds.includes(course.id));
                try {
                    await studyPlan.save();
                    res.status(200).json(semplan.courses);
                }
                catch (error) {
                    next(new error_1.BadRequestError());
                }
            }
            else {
                next(new error_1.NotFoundError("Keinen passenden Semesterplan gefunden."));
            }
        }
        else {
            next(new error_1.NotFoundError("Keinen passenden Studienplan gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function importSemesterPlan(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const newSemesterPlan = (0, custom_validator_1.validateAndReturnSemesterPlanTemplate)(req.body.semesterPlan);
    const user = req.user;
    if (semester && newSemesterPlan && user._id) {
        try {
            const studyPlan = await (0, plan_helper_1.findActiveStudyPlan)(user._id);
            if (studyPlan) {
                const existingSemesterPlan = studyPlan.semesterPlans.find((el) => el.semester === semester);
                if (existingSemesterPlan) {
                    existingSemesterPlan.isPastSemester = newSemesterPlan.isPastSemester;
                    existingSemesterPlan.courses = newSemesterPlan.courses;
                    await studyPlan.save();
                    res.json(existingSemesterPlan);
                }
                else {
                    next(new error_1.NotFoundError("Der importierte Stundenplan ist aus einem falschen Semester"));
                }
            }
            else {
                next(new error_1.NotFoundError("Keinen passenden Studienplan gefunden."));
            }
        }
        catch (error) {
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
