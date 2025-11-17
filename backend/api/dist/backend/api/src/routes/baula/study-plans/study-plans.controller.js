"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStudyPlansOfUser = getAllStudyPlansOfUser;
exports.checkStudyPlanTemplateAvailability = checkStudyPlanTemplateAvailability;
exports.getLatestTemplateForStudyProgram = getLatestTemplateForStudyProgram;
exports.getActiveStudyPlan = getActiveStudyPlan;
exports.createStudyPlan = createStudyPlan;
exports.updateStudyPlan = updateStudyPlan;
exports.addModulesToCurrentSemesterOfAllStudyPlans = addModulesToCurrentSemesterOfAllStudyPlans;
exports.transferModule = transferModule;
exports.transferUserGeneratedModule = transferUserGeneratedModule;
exports.deleteStudyPlan = deleteStudyPlan;
const mongo_1 = require("../../../database/mongo");
const custom_validator_1 = require("../../../shared/helpers/custom-validator");
const error_1 = require("../../../shared/error");
const validator_1 = __importDefault(require("validator"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const plan_helper_1 = require("../../../shared/helpers/plan-helper");
// GET REQUESTS
async function getAllStudyPlansOfUser(req, res, next) {
    const user = req.user;
    try {
        const result = await mongo_1.StudyPlan.find({ userId: user._id }).exec();
        if (result) {
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Es konnten keine Studienpläne gefunden werden!"));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError());
    }
}
async function checkStudyPlanTemplateAvailability(req, res) {
    const programId = validator_1.default.isAlphanumeric(req.params.programId, undefined)
        ? req.params.programId
        : undefined;
    const semesterType = ["w", "s"].includes(req.params.semesterType)
        ? req.params.semesterType
        : undefined;
    try {
        if (programId && semesterType) {
            const directoryPath = path_1.default.join(__dirname, "../../../../staticdata/studyplan-templates");
            const files = await promises_1.default.readdir(directoryPath);
            // Filter files by programId
            const relevantFiles = files.filter((file) => file.includes(programId));
            if (relevantFiles.length !== 0) {
                // Find the latest plan based on the semester type
                const latestPlanFile = (0, plan_helper_1.getLatestPlanFilename)(relevantFiles, semesterType);
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
            const directoryPath = path_1.default.join(__dirname, "../../../../staticdata/studyplan-templates");
            const files = await promises_1.default.readdir(directoryPath);
            // Filter files by programId
            const relevantFiles = files.filter((file) => file.includes(programId));
            if (relevantFiles.length !== 0) {
                // Find the latest plan based on the semester type
                const latestPlanFile = (0, plan_helper_1.getLatestPlanFilename)(relevantFiles, semesterType);
                if (latestPlanFile) {
                    // Read and parse the latest JSON file
                    const filePath = path_1.default.join(directoryPath, latestPlanFile);
                    const fileContent = await promises_1.default.readFile(filePath, "utf-8");
                    const studyPlan = JSON.parse(fileContent);
                    // Send the parsed JSON content as a response
                    return res.status(200).json(studyPlan);
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
async function getActiveStudyPlan(req, res, next) {
    const user = req.user;
    try {
        const result = await mongo_1.StudyPlan.findOne({ userId: user._id, status: true });
        if (result) {
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Es konnte kein aktiver Studienplan gefunden werden!"));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError());
    }
}
// CREATE REQUESTS
async function createStudyPlan(req, res, next) {
    const studyPlan = (0, custom_validator_1.validateAndReturnStudyPlan)(req.body.studyPlan);
    const user = req.user;
    try {
        // check user and if input is of type studyPlan
        if (user && studyPlan) {
            // check if user id is set in semester plans to prevent errors
            for (let plan of studyPlan.semesterPlans) {
                if (!plan.userId) {
                    plan.userId = user._id;
                }
            }
            // create new studyPlan
            const createdStudyplan = await mongo_1.StudyPlan.create({
                name: studyPlan.name,
                status: studyPlan.status,
                semesterPlans: studyPlan.semesterPlans,
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
        next(new error_1.BadRequestError());
    }
}
// UPDATE REQUESTS
async function updateStudyPlan(req, res, next) {
    const studyPlanId = (0, custom_validator_1.validateObjectId)(req.body.studyPlanId)
        ? req.body.studyPlanId
        : undefined;
    const studyPlan = (0, custom_validator_1.validateAndReturnStudyPlan)(req.body.studyPlan);
    const user = req.user;
    if (studyPlanId && studyPlan && user._id) {
        try {
            const result = await mongo_1.StudyPlan.updateOne({ _id: studyPlanId, userId: user._id }, {
                name: studyPlan.name,
                status: studyPlan.status,
                semesterPlans: studyPlan.semesterPlans,
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
async function addModulesToCurrentSemesterOfAllStudyPlans(req, res, next) {
    const user = req.user;
    const modules = Array.isArray(req.body.modules)
        ? req.body.modules
        : [];
    const semesterName = req.body.semesterName;
    if (!user._id || !semesterName || modules.length === 0) {
        return next(new error_1.BadRequestError("Ungültige Parameter"));
    }
    try {
        const studyPlans = await mongo_1.StudyPlan.find({ userId: user._id }).exec();
        if (studyPlans.length > 0) {
            // iterate over study plans and find current semester plan
            for (const studyPlan of studyPlans) {
                const currentSemesterPlan = studyPlan.semesterPlans.find((semesterPlan) => semesterPlan.semester === semesterName);
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
                    studyPlan.markModified('semesterPlans');
                    await studyPlan.save();
                }
            }
        }
        return res.status(200).json(studyPlans);
    }
    catch (err) {
        next(err);
    }
}
async function transferModule(req, res, next) {
    const studyPlanId = (0, custom_validator_1.validateObjectId)(req.body.studyPlanId)
        ? req.body.studyPlanId
        : undefined;
    const oldSemesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.oldSemesterPlanId)
        ? req.body.oldSemesterPlanId
        : undefined;
    const newSemesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.newSemesterPlanId)
        ? req.body.newSemesterPlanId
        : undefined;
    const acronym = validator_1.default.isAlphanumeric(req.body.acronym, "de-DE", {
        ignore: "-",
    })
        ? req.body.acronym
        : undefined;
    const ects = !Number.isNaN(Number(req.body.ects)) ? Number(req.body.ects) : 0;
    if (studyPlanId && oldSemesterPlanId && newSemesterPlanId && acronym) {
        try {
            const studyPlan = await mongo_1.StudyPlan.findById(studyPlanId);
            if (studyPlan) {
                const oldSemesterPlan = studyPlan.semesterPlans.find((el) => el._id.toString() === oldSemesterPlanId);
                const newSemesterPlan = studyPlan.semesterPlans.find((el) => el._id.toString() === newSemesterPlanId);
                if (oldSemesterPlan && newSemesterPlan) {
                    // delete module from oldSemesterPlan and add to newSemesterPlan
                    oldSemesterPlan.modules = oldSemesterPlan.modules.filter((el) => el !== acronym);
                    oldSemesterPlan.summedEcts -= ects;
                    newSemesterPlan.modules.push(acronym);
                    newSemesterPlan.summedEcts += ects;
                    const result = await studyPlan.save();
                    if (result) {
                        res.status(200).json({ oldSemesterPlan, newSemesterPlan });
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
    const studyPlanId = (0, custom_validator_1.validateObjectId)(req.body.studyPlanId)
        ? req.body.studyPlanId
        : undefined;
    const oldSemesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.oldSemesterPlanId)
        ? req.body.oldSemesterPlanId
        : undefined;
    const newSemesterPlanId = (0, custom_validator_1.validateObjectId)(req.body.newSemesterPlanId)
        ? req.body.newSemesterPlanId
        : undefined;
    const module = (0, custom_validator_1.validateAndReturnUserGeneratedModule)(req.body.module);
    if (studyPlanId && oldSemesterPlanId && newSemesterPlanId && module) {
        try {
            const studyPlan = await mongo_1.StudyPlan.findById(studyPlanId);
            if (studyPlan) {
                const oldSemesterPlan = studyPlan.semesterPlans.find((el) => el._id.toString() === oldSemesterPlanId);
                const newSemesterPlan = studyPlan.semesterPlans.find((el) => el._id.toString() === newSemesterPlanId);
                if (oldSemesterPlan && newSemesterPlan) {
                    // delete module from oldSemesterPlan and add to newSemesterPlan
                    oldSemesterPlan.userGeneratedModules =
                        oldSemesterPlan.userGeneratedModules.filter((el) => el._id.toString() !== module._id);
                    oldSemesterPlan.summedEcts -= module.ects;
                    newSemesterPlan.userGeneratedModules.push(module);
                    newSemesterPlan.summedEcts += module.ects;
                    const result = await studyPlan.save();
                    if (result) {
                        res.status(200).json({ oldSemesterPlan, newSemesterPlan });
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
async function deleteStudyPlan(req, res, next) {
    const studyPlanId = (0, custom_validator_1.validateObjectId)(req.params.id)
        ? req.params.id
        : undefined;
    const user = req.user;
    if (studyPlanId && user._id) {
        try {
            const result = await mongo_1.StudyPlan.deleteOne({
                _id: studyPlanId,
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
