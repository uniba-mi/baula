"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStudyplansOfUser = getAllStudyplansOfUser;
exports.checkStudyplanTemplateAvailability = checkStudyplanTemplateAvailability;
exports.getLatestTemplateForStudyProgram = getLatestTemplateForStudyProgram;
exports.getActiveStudyplan = getActiveStudyplan;
exports.createStudyplan = createStudyplan;
exports.updateStudyplan = updateStudyplan;
exports.addModulesToCurrentSemesterOfAllStudyplans = addModulesToCurrentSemesterOfAllStudyplans;
exports.transferModule = transferModule;
exports.transferUserGeneratedModule = transferUserGeneratedModule;
exports.deleteStudyplan = deleteStudyplan;
const mongo_1 = require("../../database/mongo");
const customValidator_1 = require("../../shared/customValidator");
const error_1 = require("../../shared/error");
const validator_1 = __importDefault(require("validator"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const semester_1 = require("../../../../../interfaces/semester");
// GET REQUESTS
async function getAllStudyplansOfUser(req, res, next) {
    const user = req.user;
    try {
        const result = await mongo_1.Studyplan.find({ userId: user._id }).exec();
        if (result) {
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Es konnten keine Studienpläne gefunden werden!"));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError("Es ist ein Fehler aufgetreten!"));
    }
}
async function checkStudyplanTemplateAvailability(req, res) {
    const programId = validator_1.default.isAlphanumeric(req.params.programId, undefined)
        ? req.params.programId
        : undefined;
    const semesterType = ["w", "s"].includes(req.params.semesterType)
        ? req.params.semesterType
        : undefined;
    try {
        if (programId && semesterType) {
            const directoryPath = path_1.default.join(__dirname, "../../../staticdata/studyplan_templates");
            const files = await promises_1.default.readdir(directoryPath);
            // Filter files by programId
            const relevantFiles = files.filter((file) => file.includes(programId));
            if (relevantFiles.length !== 0) {
                // Find the latest plan based on the semester type
                const latestPlanFile = getLatestPlanFilename(relevantFiles, semesterType);
                if (latestPlanFile) {
                    return res.status(200).json({ available: true });
                }
            }
        }
        // If no template is found, return a response indicating it's not available
        return res.status(200).json({ available: false });
    }
    catch (err) {
        console.error(err);
        return res.status(200).json({ available: false });
    }
}
async function getLatestTemplateForStudyProgram(req, res) {
    const programId = validator_1.default.isAlphanumeric(req.params.programId, undefined)
        ? req.params.programId
        : undefined;
    const semesterType = ["w", "s"].includes(req.params.semesterType)
        ? req.params.semesterType
        : undefined;
    try {
        if (programId && semesterType) {
            const directoryPath = path_1.default.join(__dirname, "../../../staticdata/studyplan_templates");
            const files = await promises_1.default.readdir(directoryPath);
            // Filter files by programId
            const relevantFiles = files.filter((file) => file.includes(programId));
            if (relevantFiles.length !== 0) {
                // Find the latest plan based on the semester type
                const latestPlanFile = getLatestPlanFilename(relevantFiles, semesterType);
                if (latestPlanFile) {
                    // Read and parse the latest JSON file
                    const filePath = path_1.default.join(directoryPath, latestPlanFile);
                    const fileContent = await promises_1.default.readFile(filePath, "utf-8");
                    const studyplan = JSON.parse(fileContent);
                    // Send the parsed JSON content as a response
                    return res.status(200).json(studyplan);
                }
            }
        }
        // If no template is found, return a 404 status
        return res.status(404).send("Musterstudienverlaufsplan nicht gefunden.");
    }
    catch (err) {
        console.error(err);
        return res.status(500).send("Fehler beim Abrufen des Studienplans.");
    }
}
async function getActiveStudyplan(req, res, next) {
    const user = req.user;
    try {
        const result = await mongo_1.Studyplan.findOne({ userId: user._id, status: true });
        if (result) {
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Es konnte kein aktiver Studienplan gefunden werden!"));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError("Es ist ein Fehler aufgetreten!"));
    }
}
// CREATE REQUESTS
async function createStudyplan(req, res, next) {
    const studyplan = (0, customValidator_1.validateAndReturnStudyplan)(req.body.studyplan);
    const user = req.user;
    try {
        // check user and if input is of type studyplan
        if (user && studyplan) {
            // check if user id is set in semesterplans to prevent errors
            for (let plan of studyplan.semesterPlans) {
                if (!plan.userId) {
                    plan.userId = user._id;
                }
            }
            // create new studyplan
            const createdStudyplan = await mongo_1.Studyplan.create({
                name: studyplan.name,
                status: studyplan.status,
                semesterPlans: studyplan.semesterPlans,
                userId: user._id,
            });
            if (createdStudyplan) {
                res.status(200).json(createdStudyplan);
            }
            else {
                next(new error_1.NotFoundError("Es konnte kein valider Studienplan angelegt werden."));
            }
        }
        else {
            next(new error_1.BadRequestError("Die Eingaben sind fehlerhaft."));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError("Es ist ein Fehler aufgetreten!"));
    }
}
// UPDATE REQUESTS
async function updateStudyplan(req, res, next) {
    const studyplanId = (0, customValidator_1.validateObjectId)(req.body.studyplanId)
        ? req.body.studyplanId
        : undefined;
    const studyplan = (0, customValidator_1.validateAndReturnStudyplan)(req.body.studyplan);
    const user = req.user;
    if (studyplanId && studyplan && user._id) {
        try {
            const result = await mongo_1.Studyplan.updateOne({ _id: studyplanId, userId: user._id }, {
                name: studyplan.name,
                status: studyplan.status,
                semesterPlans: studyplan.semesterPlans,
            });
            res.status(200).json(result);
        }
        catch (error) {
            next(new error_1.NotFoundError("Zu den angegebenen Daten wurde kein Eintrag gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
// add modules to the current semester of all study plans of a user
async function addModulesToCurrentSemesterOfAllStudyplans(req, res, next) {
    const user = req.user;
    const modules = Array.isArray(req.body.modules)
        ? req.body.modules
        : [];
    const semesterName = req.body.semesterName;
    if (!user._id || !semesterName || modules.length === 0) {
        return next(new error_1.BadRequestError("Ungültige Parameter"));
    }
    try {
        const studyplans = await mongo_1.Studyplan.find({ userId: user._id }).exec();
        if (studyplans.length > 0) {
            // iterate over studyplans and find current semester plan
            for (const studyplan of studyplans) {
                const currentSemesterPlan = studyplan.semesterPlans.find((semesterPlan) => semesterPlan.semester === semesterName);
                if (currentSemesterPlan) {
                    // add modules to current semester
                    modules.forEach((module) => {
                        var _a;
                        const moduleExistsInUserGeneratedModules = currentSemesterPlan.userGeneratedModules.some((existingModule) => existingModule.acronym === module.acronym);
                        const moduleExistsInModules = currentSemesterPlan.modules.includes(module.acronym);
                        // new modules is only added if it is neither in usergenerated modules nor in "normal" modules
                        if (!moduleExistsInUserGeneratedModules && !moduleExistsInModules) {
                            const newModule = {
                                ...module,
                                flexNowImported: (_a = module.flexNowImported) !== null && _a !== void 0 ? _a : true,
                            };
                            currentSemesterPlan.userGeneratedModules.push(newModule);
                            currentSemesterPlan.summedEcts += module.ects;
                        }
                    });
                    studyplan.markModified('semesterPlans');
                    await studyplan.save();
                }
            }
        }
        return res.status(200).json(studyplans);
    }
    catch (err) {
        next(err);
    }
}
async function transferModule(req, res, next) {
    const studyplanId = (0, customValidator_1.validateObjectId)(req.body.studyplanId)
        ? req.body.studyplanId
        : undefined;
    const oldSemesterplanId = (0, customValidator_1.validateObjectId)(req.body.oldSemesterplanId)
        ? req.body.oldSemesterplanId
        : undefined;
    const newSemesterplanId = (0, customValidator_1.validateObjectId)(req.body.newSemesterPlanId)
        ? req.body.newSemesterPlanId
        : undefined;
    const acronym = validator_1.default.isAlphanumeric(req.body.acronym, "de-DE", {
        ignore: "-",
    })
        ? req.body.acronym
        : undefined;
    const ects = !Number.isNaN(Number(req.body.ects)) ? Number(req.body.ects) : 0;
    if (studyplanId && oldSemesterplanId && newSemesterplanId && acronym) {
        try {
            const studyplan = await mongo_1.Studyplan.findById(studyplanId);
            if (studyplan) {
                const oldSemesterplan = studyplan.semesterPlans.find((el) => el._id.toString() === oldSemesterplanId);
                const newSemesterplan = studyplan.semesterPlans.find((el) => el._id.toString() === newSemesterplanId);
                if (oldSemesterplan && newSemesterplan) {
                    // delete module from oldSemesterplan and add to newSemesterplan
                    oldSemesterplan.modules = oldSemesterplan.modules.filter((el) => el !== acronym);
                    oldSemesterplan.summedEcts -= ects;
                    newSemesterplan.modules.push(acronym);
                    newSemesterplan.summedEcts += ects;
                    const result = await studyplan.save();
                    if (result) {
                        res.status(200).json({ oldSemesterplan, newSemesterplan });
                    }
                    else {
                        next(new error_1.BadRequestError());
                    }
                }
                else {
                    next(new error_1.NotFoundError());
                }
            }
            else {
                next(new error_1.NotFoundError());
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
async function transferUserGeneratedModule(req, res, next) {
    const studyplanId = (0, customValidator_1.validateObjectId)(req.body.studyplanId)
        ? req.body.studyplanId
        : undefined;
    const oldSemesterplanId = (0, customValidator_1.validateObjectId)(req.body.oldSemesterplanId)
        ? req.body.oldSemesterplanId
        : undefined;
    const newSemesterplanId = (0, customValidator_1.validateObjectId)(req.body.newSemesterPlanId)
        ? req.body.newSemesterPlanId
        : undefined;
    const module = (0, customValidator_1.validateAndReturnUserGeneratedModule)(req.body.module);
    if (studyplanId && oldSemesterplanId && newSemesterplanId && module) {
        try {
            const studyplan = await mongo_1.Studyplan.findById(studyplanId);
            if (studyplan) {
                const oldSemesterplan = studyplan.semesterPlans.find((el) => el._id.toString() === oldSemesterplanId);
                const newSemesterplan = studyplan.semesterPlans.find((el) => el._id.toString() === newSemesterplanId);
                if (oldSemesterplan && newSemesterplan) {
                    // delete module from oldSemesterplan and add to newSemesterplan
                    oldSemesterplan.userGeneratedModules =
                        oldSemesterplan.userGeneratedModules.filter((el) => el._id.toString() !== module._id);
                    oldSemesterplan.summedEcts -= module.ects;
                    newSemesterplan.userGeneratedModules.push(module);
                    newSemesterplan.summedEcts += module.ects;
                    const result = await studyplan.save();
                    if (result) {
                        res.status(200).json({ oldSemesterplan, newSemesterplan });
                    }
                    else {
                        next(new error_1.BadRequestError());
                    }
                }
                else {
                    next(new error_1.NotFoundError());
                }
            }
            else {
                next(new error_1.NotFoundError());
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
// DELETE REQUESTS
async function deleteStudyplan(req, res, next) {
    const studyplanId = (0, customValidator_1.validateObjectId)(req.params.id)
        ? req.params.id
        : undefined;
    const user = req.user;
    if (studyplanId && user._id) {
        try {
            const result = await mongo_1.Studyplan.deleteOne({
                _id: studyplanId,
                userId: user._id,
            });
            if (result.deletedCount !== 0) {
                res.status(200).json(result);
            }
            else {
                next(new error_1.NotFoundError("Mit den angegebenen Daten konnte kein Studienplan gelöscht werden."));
            }
        }
        catch (error) {
            next(error);
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
// Helper function to get the latest plan filename based on semester type
function getLatestPlanFilename(files, semesterType) {
    let latestPlanFilename;
    let latestSemester;
    files.forEach((file) => {
        const match = file.match(/_(\d{4})([sw])/);
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
