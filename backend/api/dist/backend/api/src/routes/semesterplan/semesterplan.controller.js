"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserGeneratedModule = createUserGeneratedModule;
exports.addModule = addModule;
exports.updateUserGeneratedModule = updateUserGeneratedModule;
exports.initSemesterplans = initSemesterplans;
exports.addSemesterplanToStudyplan = addSemesterplanToStudyplan;
exports.updateSemesterplanAimedEcts = updateSemesterplanAimedEcts;
exports.updateIsPastSemester = updateIsPastSemester;
exports.deleteModule = deleteModule;
exports.deleteUserGeneratedModule = deleteUserGeneratedModule;
exports.deleteUserGeneratedModules = deleteUserGeneratedModules;
exports.addCourse = addCourse;
exports.deleteCourse = deleteCourse;
exports.addCourses = addCourses;
exports.deleteCourses = deleteCourses;
exports.getAllSavedCourses = getAllSavedCourses;
exports.importSemesterplan = importSemesterplan;
const mongo_1 = require("../../database/mongo");
const customValidator_1 = require("../../shared/customValidator");
const validator_1 = __importDefault(require("validator"));
const error_1 = require("../../shared/error");
const client_1 = require("@prisma/client");
const logger_1 = require("../../shared/logger");
const prisma = new client_1.PrismaClient();
async function createUserGeneratedModule(req, res, next) {
    var _a, _b;
    const studyplanId = (_b = (_a = req.body.studyplanId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : undefined;
    const semesterplanId = (0, customValidator_1.validateObjectId)(req.body.semesterplanId)
        ? req.body.semesterplanId
        : undefined;
    const module = (0, customValidator_1.validateAndReturnUserGeneratedModule)(req.body.module);
    const ects = module && module.ects ? Number(module.ects) : 0;
    const studyplan = await findStudyplan(studyplanId);
    if (studyplan && semesterplanId && module) {
        const semesterplan = studyplan.semesterPlans.find((el) => el._id == semesterplanId);
        if (semesterplan && semesterplan.userGeneratedModules) {
            try {
                const newModuleIndex = semesterplan.userGeneratedModules.push(module);
                semesterplan.summedEcts += ects;
                await studyplan.save();
                res
                    .status(200)
                    .json(semesterplan.userGeneratedModules[newModuleIndex - 1]);
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
// Hier jetzt Versuch mit findOneAndUpdate statt await studyplan save
async function addModule(req, res, next) {
    const studyplanId = typeof req.body.studyplanId === "string" ? req.body.studyplanId : undefined;
    const semesterplanId = (0, customValidator_1.validateObjectId)(req.body.semesterplanId)
        ? req.body.semesterplanId
        : undefined;
    const mod = typeof req.body.module === "string" &&
        validator_1.default.isAlphanumeric(req.body.module, "de-DE", { ignore: "- ." })
        ? req.body.module
        : undefined;
    const ects = !Number.isNaN(Number(req.body.ects)) ? Number(req.body.ects) : 0;
    if (studyplanId && semesterplanId && mod) {
        try {
            const updatedStudyplan = await mongo_1.Studyplan.findOneAndUpdate({ _id: studyplanId, "semesterPlans._id": semesterplanId }, {
                $push: { "semesterPlans.$.modules": mod },
                $inc: { "semesterPlans.$.summedEcts": ects },
            }, { new: true, runValidators: true });
            if (updatedStudyplan) {
                const updatedSemesterPlan = updatedStudyplan.semesterPlans.find((el) => el._id.toString() === semesterplanId);
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
    const studyplanId = typeof req.body.studyplanId === "string" ? req.body.studyplanId : undefined;
    const semesterplanId = (0, customValidator_1.validateObjectId)(req.body.semesterplanId)
        ? req.body.semesterplanId
        : undefined;
    const moduleId = (0, customValidator_1.validateObjectId)(req.body.moduleId)
        ? req.body.moduleId
        : undefined;
    const module = (0, customValidator_1.validateAndReturnUserGeneratedModule)(req.body.module);
    if (!studyplanId || !semesterplanId || !module || !moduleId) {
        return next(new error_1.BadRequestError("Ungültige Inputs"));
    }
    try {
        const studyplan = await mongo_1.Studyplan.findOne({
            _id: studyplanId,
            "semesterPlans._id": semesterplanId,
            "semesterPlans.userGeneratedModules._id": moduleId,
        }, { "semesterPlans.$": 1 });
        if (!studyplan) {
            return next(new error_1.NotFoundError("Studienplan wurde nicht gefunden."));
        }
        const semesterplan = studyplan.semesterPlans.find((el) => el._id.toString() === semesterplanId);
        if (!semesterplan) {
            return next(new error_1.NotFoundError("Semesterplan wurde nicht gefunden."));
        }
        const moduleToUpdate = semesterplan.userGeneratedModules.find((el) => el._id.toString() === moduleId);
        if (!moduleToUpdate) {
            return next(new error_1.NotFoundError("Modul wurde nicht gefunden."));
        }
        const newSummedEcts = semesterplan.summedEcts - moduleToUpdate.ects + module.ects;
        const updatedStudyplan = await mongo_1.Studyplan.findOneAndUpdate({
            _id: studyplanId,
            "semesterPlans._id": semesterplanId,
            "semesterPlans.userGeneratedModules._id": moduleId,
        }, {
            $set: {
                "semesterPlans.$[semesterplan].userGeneratedModules.$[module].ects": module.ects,
                "semesterPlans.$[semesterplan].userGeneratedModules.$[module].name": module.name,
                "semesterPlans.$[semesterplan].userGeneratedModules.$[module].notes": module.notes,
                "semesterPlans.$[semesterplan].summedEcts": newSummedEcts,
            },
        }, {
            new: true,
            arrayFilters: [
                { "semesterplan._id": semesterplanId },
                { "module._id": moduleId },
            ],
            runValidators: true,
        });
        if (!updatedStudyplan) {
            return next(new error_1.NotFoundError("Semesterplan wurde im Studienplan nicht gefunden."));
        }
        const updatedSemesterPlan = updatedStudyplan.semesterPlans.find((el) => el._id.toString() === semesterplanId);
        const updatedModule = updatedSemesterPlan === null || updatedSemesterPlan === void 0 ? void 0 : updatedSemesterPlan.userGeneratedModules.find((el) => el._id.toString() === moduleId);
        res.status(200).json(updatedModule);
    }
    catch (error) {
        next(error);
    }
}
async function initSemesterplans(req, res, next) {
    const id = typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
    const semesterplans = req.body.semesterPlans;
    const studyplan = await findStudyplan(id);
    const user = req.user;
    if (Array.isArray(semesterplans) && studyplan && user) {
        for (let semesterplan of semesterplans) {
            // check if userId is set correctly otherwise set it
            semesterplan.userId = semesterplan.userId ? semesterplan.userId : user._id;
            const validatedSemesterplan = (0, customValidator_1.validateAndReturnSemesterplan)(semesterplan);
            if (validatedSemesterplan) {
                studyplan.semesterPlans.push(validatedSemesterplan);
            }
        }
        await studyplan.save();
        res.status(200).json(studyplan.semesterPlans);
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function addSemesterplanToStudyplan(req, res, next) {
    const user = req.user;
    const spId = typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    if (spId && user._id && semester) {
        const studyplan = await findStudyplan(spId);
        if (studyplan) {
            try {
                const newSemsterplan = {
                    modules: [],
                    userGeneratedModules: [],
                    courses: [],
                    userId: user._id,
                    semester: semester,
                    isPastSemester: false,
                    aimedEcts: 0,
                    summedEcts: 0,
                };
                studyplan.semesterPlans.push(newSemsterplan);
                await studyplan.save();
                res.status(200).json(studyplan);
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
async function updateSemesterplanAimedEcts(req, res, next) {
    const spId = typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
    const semesterplanId = (0, customValidator_1.validateObjectId)(req.body.semesterplanId)
        ? req.body.semesterplanId
        : undefined;
    const aimedEcts = req.body.aimedEcts &&
        validator_1.default.isInt(String(req.body.aimedEcts), { min: 0, max: 210 })
        ? Number(req.body.aimedEcts)
        : undefined;
    const studyplan = await findStudyplan(spId);
    if (studyplan && semesterplanId && aimedEcts) {
        const semesterplan = studyplan.semesterPlans.find((el) => el._id == semesterplanId);
        if (semesterplan && semesterplan.aimedEcts !== undefined) {
            semesterplan.aimedEcts = aimedEcts;
            await studyplan.save();
            res.status(200).json(semesterplan);
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
    const spId = typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
    const semesterplanId = (0, customValidator_1.validateObjectId)(req.body.semesterplanId)
        ? req.body.semesterplanId
        : undefined;
    const isPast = Boolean(req.body.isPast);
    const studyplan = await findStudyplan(spId);
    if (studyplan && semesterplanId && isPast) {
        const semesterplan = studyplan.semesterPlans.find((el) => el._id == semesterplanId);
        if (semesterplan) {
            try {
                semesterplan.isPastSemester = isPast;
                await studyplan.save();
                res.status(200).json(semesterplan);
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
    const studyplanId = typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
    const semesterplanId = (0, customValidator_1.validateObjectId)(req.body.semesterplanId)
        ? req.body.semesterplanId
        : undefined;
    const mod = typeof req.body.module == "string" ? req.body.module : undefined;
    const ects = !Number.isNaN(Number(req.body.ects))
        ? Number(req.body.ects)
        : undefined;
    const studyplan = await findStudyplan(studyplanId);
    if (studyplan && semesterplanId && mod && ects) {
        const semesterplan = studyplan.semesterPlans.find((el) => el._id == semesterplanId);
        if (semesterplan) {
            const index = semesterplan.modules.findIndex((el) => el == mod);
            if (index !== -1) {
                const deleted = semesterplan.modules.splice(index, 1);
                semesterplan.summedEcts -= ects;
                // TODO: Hier tritt ein Fehler auf, wenn man ein Modul zwischen Semestern hin und her verschiebt, vermutlich weil das Hinzufügen und Löschen beide auf den studyplan zugreifen.
                await studyplan.save();
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
    const studyplanId = typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
    const semesterplanId = (0, customValidator_1.validateObjectId)(req.body.semesterplanId)
        ? req.body.semesterplanId
        : undefined;
    const module = (0, customValidator_1.validateAndReturnUserGeneratedModule)(req.body.module);
    const studyplan = await findStudyplan(studyplanId);
    if (studyplan && semesterplanId && module) {
        const semesterplan = studyplan.semesterPlans.find((el) => el._id == semesterplanId);
        if (semesterplan && semesterplan.userGeneratedModules) {
            const index = semesterplan.userGeneratedModules.findIndex((el) => el._id == module._id);
            if (index !== -1) {
                const deleted = semesterplan.userGeneratedModules.splice(index, 1);
                semesterplan.summedEcts -= module.ects;
                await studyplan.save();
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
    const studyplanId = typeof req.body.studyplanId == "string" ? req.body.studyplanId : undefined;
    const semesterplanId = (0, customValidator_1.validateObjectId)(req.body.semesterplanId)
        ? req.body.semesterplanId
        : undefined;
    const moduleIds = Array.isArray(req.body.moduleIds)
        ? req.body.moduleIds
        : [];
    const studyplan = await findStudyplan(studyplanId);
    if (studyplan && semesterplanId && moduleIds.length > 0) {
        const semesterplan = studyplan.semesterPlans.find((el) => el._id == semesterplanId);
        if (semesterplan && semesterplan.userGeneratedModules) {
            const deletedModules = [];
            moduleIds.forEach((moduleId) => {
                const index = semesterplan.userGeneratedModules.findIndex((el) => el._id == moduleId);
                if (index !== -1) {
                    const [deleted] = semesterplan.userGeneratedModules.splice(index, 1);
                    semesterplan.summedEcts -= deleted.ects;
                    deletedModules.push(deleted);
                }
            });
            if (deletedModules.length > 0) {
                await studyplan.save();
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
// add course to semesterplan
async function addCourse(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const course = (0, customValidator_1.validateAndReturnCourse)(req.body.course);
    const isPastSemester = Boolean(req.body.isPastSemester);
    const user = req.user;
    if (semester && course && user._id) {
        const studyplan = await findActiveStudyplan(user._id);
        if (studyplan) {
            // find semesterplan
            const semesterplan = studyplan.semesterPlans.find((el) => el.semester === semester);
            if (semesterplan && semesterplan.courses) {
                semesterplan.courses.push(course);
                semesterplan.isPastSemester = isPastSemester;
                try {
                    await studyplan.save();
                    res.status(200).json(semesterplan.courses);
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
// delete course from semesterplan
async function deleteCourse(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const courseId = req.body.courseId;
    const user = req.user;
    if (semester && courseId && user._id) {
        const studyplan = await findActiveStudyplan(user._id);
        if (studyplan) {
            // find semesterplan
            const semplan = studyplan.semesterPlans.find((el) => el.semester === semester);
            if (semplan) {
                const index = semplan.courses.findIndex((el) => el.id == courseId);
                semplan.courses.splice(index, 1);
                try {
                    await studyplan.save();
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
// Add multiple courses to semesterplan
async function addCourses(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const courses = Array.isArray(req.body.courses)
        ? req.body.courses.map(customValidator_1.validateAndReturnCourse).filter(Boolean)
        : [];
    const isPastSemester = Boolean(req.body.isPastSemester);
    const user = req.user;
    if (semester && courses.length > 0 && user._id) {
        const studyplan = await findActiveStudyplan(user._id);
        if (studyplan) {
            const semplan = studyplan.semesterPlans.find((el) => el.semester === semester);
            if (semplan && semplan.courses) {
                // filter courses that are already in the plan
                const existingCourseIds = semplan.courses.map((course) => course.id);
                const newCourses = courses.filter((course) => !existingCourseIds.includes(course.id));
                if (newCourses.length > 0) {
                    semplan.courses.push(...newCourses);
                }
                semplan.isPastSemester = isPastSemester;
                try {
                    await studyplan.save();
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
// Remove multiple courses from semesterplan
async function deleteCourses(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const courseIds = Array.isArray(req.body.courseIds) ? req.body.courseIds : [];
    const user = req.user;
    if (semester && courseIds.length > 0 && user._id) {
        const studyplan = await findActiveStudyplan(user._id);
        if (studyplan) {
            const semplan = studyplan.semesterPlans.find((el) => el.semester === semester);
            if (semplan && semplan.courses) {
                semplan.courses = semplan.courses.filter((course) => !courseIds.includes(course.id));
                try {
                    await studyplan.save();
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
// get all saved courses form semesterplans and returns ExpandedCourse
async function getAllSavedCourses(req, res, next) {
    const user = req.user;
    // find active studyplan
    const studyplan = await findActiveStudyplan(user._id);
    if (studyplan) {
        let courses = [];
        const semesterplans = studyplan.semesterPlans;
        // extract courses
        for (let sempla of semesterplans) {
            if (sempla.courses.length !== 0) {
                const keys = sempla.courses.map((el) => el.id);
                const dbCourses = await prisma.course.findMany({
                    include: {
                        dozs: {
                            select: {
                                person: true,
                            },
                        },
                        terms: {
                            include: {
                                room: true,
                            },
                        },
                        competence: {
                            select: {
                                cId: true,
                                semester: true,
                                compId: true,
                                fulfillment: true,
                            },
                        },
                        mCourses: {
                            select: {
                                modCourse: true,
                            },
                        },
                    },
                    where: {
                        AND: {
                            semester: sempla.semester,
                            id: {
                                in: keys,
                            },
                        },
                    },
                });
                // map MongoDB with Prisma Entries
                for (let c of sempla.courses) {
                    const course = dbCourses.find((el) => el.id == c.id && el.semester == sempla.semester);
                    if (course) {
                        let entry = {
                            status: c.status,
                            ...course,
                            sws: c.sws,
                            ects: c.ects,
                            contributeTo: c.contributeTo,
                            contributeAs: c.contributeAs,
                            dozs: course.dozs.map((el) => el.person),
                        };
                        courses.push(entry);
                    }
                }
            }
        }
        res.status(200).json(courses);
    }
    else {
        next(new error_1.NotFoundError("Keinen passenden Studienplan gefunden."));
    }
}
async function importSemesterplan(req, res, next) {
    const semester = validator_1.default.matches(req.body.semester, /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const newSemesterplan = (0, customValidator_1.validateAndReturnSemesterplanTemplate)(req.body.semesterplan);
    const user = req.user;
    if (semester && newSemesterplan && user._id) {
        try {
            const studyplan = await findActiveStudyplan(user._id);
            if (studyplan) {
                const existingSemesterplan = studyplan.semesterPlans.find((el) => el.semester === semester);
                if (existingSemesterplan) {
                    existingSemesterplan.isPastSemester = newSemesterplan.isPastSemester;
                    existingSemesterplan.courses = newSemesterplan.courses;
                    await studyplan.save();
                    res.json(existingSemesterplan);
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
// helper functions
const findStudyplan = async (studyplanId) => {
    if ((0, customValidator_1.validateObjectId)(studyplanId)) {
        return await mongo_1.Studyplan.findById(studyplanId).exec();
    }
    else {
        return undefined;
    }
};
const findActiveStudyplan = async (uId) => {
    return await mongo_1.Studyplan.findOne({
        $and: [{ userId: uId }, { status: true }],
    });
};
