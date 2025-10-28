"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.getAcademicDatesBySemester = getAcademicDatesBySemester;
exports.getAcademicDateByTypeAndSemester = getAcademicDateByTypeAndSemester;
exports.getDateTypes = getDateTypes;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.updateModuleInStudypath = updateModuleInStudypath;
exports.updateStudypath = updateStudypath;
exports.finishSemester = finishSemester;
exports.updateCompetenceAims = updateCompetenceAims;
exports.deleteModuleFromStudypath = deleteModuleFromStudypath;
exports.deleteStudypath = deleteStudypath;
exports.deleteFavouriteModules = deleteFavouriteModules;
exports.deleteNotInterestingModules = deleteNotInterestingModules;
exports.deleteNotInterestingModule = deleteNotInterestingModule;
exports.updateDashboardView = updateDashboardView;
exports.updateTimetableSettings = updateTimetableSettings;
exports.updateFavouriteModules = updateFavouriteModules;
exports.updateNotInterestingModule = updateNotInterestingModule;
exports.toggleTopic = toggleTopic;
exports.updateHint = updateHint;
exports.addConsents = addConsents;
exports.updateModuleFeedback = updateModuleFeedback;
exports.deleteModuleFeedback = deleteModuleFeedback;
exports.addInterest = addInterest;
exports.deleteInterest = deleteInterest;
exports.deleteJob = deleteJob;
exports.deleteUser = deleteUser;
exports.crawlStudentDataViaFlexNow = crawlStudentDataViaFlexNow;
const express_1 = __importDefault(require("express"));
const mongo_1 = require("../../database/mongo");
const customValidator_1 = require("../../shared/customValidator");
const mongoose_1 = require("mongoose");
const error_1 = require("../../shared/error");
const validator_1 = __importDefault(require("validator"));
const client_1 = require("@prisma/client");
const mongoose_2 = __importDefault(require("mongoose"));
const camaro_1 = require("camaro");
const student_fn2api_1 = require("../../templates/student_fn2api");
const https_1 = __importDefault(require("https"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.use(express_1.default.json());
// Get Userdata via ShibId
async function getUser(req, res, next) {
    const user = req.user; // Use the user attached by the extractUser middleware
    try {
        const userClient = await transformUserStudypath(user);
        res.status(200).json(userClient);
    }
    catch (error) {
        (0, error_1.logError)(error);
        next(new error_1.BadRequestError("Beim Formatieren der Daten ist ein Fehler aufgetreten."));
    }
}
// get all academic dates of a semester
async function getAcademicDatesBySemester(req, res, next) {
    const semesterParam = req.params.semester;
    if (!semesterParam) {
        return next(new error_1.BadRequestError("Es wurde kein Semester angegeben."));
    }
    const semester = (0, customValidator_1.validateAndReturnSemester)(semesterParam);
    if (semester) {
        try {
            const academicdates = await prisma.academicDate.findMany({
                where: {
                    semester: semester,
                },
                include: {
                    dateType: true,
                },
            });
            res.status(200).json(academicdates);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Beim Abrufen der Daten ist ein Fehler aufgetreten."));
        }
    }
    else {
        next(new error_1.BadRequestError("Das angegebene Semester ist nicht valide."));
    }
}
// Get a single academic date by semester and date type.
async function getAcademicDateByTypeAndSemester(req, res, next) {
    const semester = (0, customValidator_1.validateAndReturnSemester)(req.params.semester);
    const type = req.params.type && validator_1.default.isNumeric(req.params.type)
        ? Number(req.params.type)
        : undefined;
    if (semester && type) {
        const academicdate = await prisma.academicDate.findFirst({
            where: {
                AND: [
                    {
                        semester: semester,
                    },
                    {
                        typeId: type,
                    },
                ],
            },
            include: {
                dateType: true,
            },
        });
        if (academicdate) {
            res.status(200).json(academicdate);
        }
        else {
            next(new error_1.NotFoundError("Es konnte kein passender Termin gefunden werden."));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
// request for datetype
async function getDateTypes(req, res, next) {
    try {
        const types = await prisma.dateType.findMany();
        res.status(200).json(types);
    }
    catch (error) {
        next(new error_1.BadRequestError(`Beim Aufrufen der Daten ist ein Fehler aufgetreten.`));
    }
}
// Create user
async function createUser(req, res, next) {
    const sentUser = req.body.user;
    const user = (0, customValidator_1.validateAndReturnUser)({
        ...sentUser,
        studypath: undefined,
        completedModules: sentUser.studypath.completedModules,
        topics: [],
        favouriteModulesAcronyms: [],
        notInterestingModulesAcronyms: [],
        moduleFeedback: []
    });
    if (user) {
        try {
            const createdUser = await mongo_1.User.create({
                ...user
            });
            // create User
            const userClient = await transformUserStudypath(createdUser);
            res.status(200).json(userClient);
        }
        catch (error) {
            console.error(error);
            next(new error_1.BadRequestError("Es ist ein Fehler aufgetreten."));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
// Update user requests
async function updateUser(req, res, next) {
    const user = (0, customValidator_1.validateAndReturnUser)(req.body.user);
    //check validity of user
    if (user) {
        try {
            const userServer = await mongo_1.User.findById({ _id: user._id }).exec();
            if (userServer) {
                userServer.shibId = user.shibId;
                userServer.roles = user.roles;
                userServer.interests = user.interests;
                userServer.startSemester = user.startSemester;
                userServer.duration = user.duration;
                userServer.maxEcts = user.maxEcts;
                userServer.sps = user.sps;
                userServer.fulltime = user.fulltime;
                userServer.completedModules = user.completedModules;
                userServer.dashboardSettings = user.dashboardSettings;
                userServer.timetableSettings = user.timetableSettings;
                userServer.favouriteModulesAcronyms = user.favouriteModulesAcronyms;
                userServer.notInterestingModulesAcronyms =
                    user.notInterestingModulesAcronyms;
                userServer.topics = user.topics;
                userServer.hints = user.hints;
                userServer.consents = user.consents;
                userServer.moduleFeedback = user.moduleFeedback;
                await userServer.save();
                const userClient = await transformUserStudypath(userServer);
                res.status(200).json(userClient);
            }
            else {
                next(new error_1.NotFoundError("Keinen Nutzer gefunden"));
            }
        }
        catch (error) {
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
// for editing a specific PathModule in the STUDYPATH by _id not acronym
async function updateModuleInStudypath(req, res, next) {
    const _id = (0, customValidator_1.validateObjectId)(req.body._id) ? req.body._id : undefined;
    const acronym = typeof req.body.acronym === "string" && req.body.acronym.trim().length > 0
        ? req.body.acronym
        : undefined;
    const name = typeof req.body.name == "string" ? req.body.name : undefined;
    const status = typeof req.body.status == "string" ? req.body.status : undefined;
    const ects = validator_1.default.isInt(String(req.body.ects))
        ? Number(req.body.ects)
        : undefined;
    const grade = typeof req.body.grade == "number" ? req.body.grade : undefined;
    const semester = validator_1.default.matches(String(req.body.semester), /\d{4}((w)|(s))/g)
        ? req.body.semester
        : undefined;
    const userReq = req.user;
    const isUserGenerated = req.body.isUserGenerated;
    const flexNowImported = req.body.flexNowImported;
    const mgId = typeof req.body.mgId == "string" ? req.body.mgId : undefined;
    // check if all values are contained in body
    if (acronym &&
        name &&
        status &&
        userReq._id &&
        ects &&
        semester &&
        mgId &&
        isUserGenerated !== undefined &&
        flexNowImported !== undefined) {
        try {
            let user = await mongo_1.User.findById(userReq._id);
            if (user) {
                // check if completed Modules exist (for legacy reasons)
                if (!user.completedModules) {
                    user.completedModules = [];
                }
                // convert _id to ObjectId for proper comparison
                const objectId = new mongoose_1.Types.ObjectId(_id);
                // check if the module already exists using ObjectId comparison
                const exist = user.completedModules.find((el) => {
                    if (el._id) {
                        return el._id.toString() === objectId.toString();
                    }
                    return false;
                });
                if (exist) {
                    exist.acronym = acronym;
                    exist.name = name;
                    exist.ects = ects;
                    exist.status = status;
                    exist.semester = semester;
                    exist.grade = grade;
                    exist.mgId = mgId;
                    exist.isUserGenerated = isUserGenerated;
                    exist.flexNowImported = flexNowImported;
                }
                else {
                    user.completedModules.push({
                        _id: _id || new mongoose_2.default.Types.ObjectId(), // use _id if provided (in case of user generated modules), else generate a new one
                        acronym,
                        name,
                        ects,
                        status,
                        grade,
                        semester,
                        mgId,
                        isUserGenerated,
                        flexNowImported,
                    });
                }
                const result = await user.save();
                const userClient = await transformUserStudypath(result);
                res.status(200).json(userClient.studypath);
            }
            else {
                next(new error_1.NotFoundError("Keinen Nutzer gefunden"));
            }
        }
        catch (error) {
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.NotFoundError("Parameter fehlen"));
    }
}
// update several modules at once
async function updateStudypath(req, res, next) {
    const userReq = req.user;
    const modulesToUpdate = req.body.completedModules;
    if (!userReq._id || !Array.isArray(modulesToUpdate)) {
        return next(new error_1.BadRequestError("Ungültige Parameter"));
    }
    try {
        const user = await mongo_1.User.findById(userReq._id);
        if (!user) {
            return next(new error_1.NotFoundError("Nutzer wurde nicht gefunden"));
        }
        if (!user.completedModules) {
            user.completedModules = [];
        }
        modulesToUpdate.forEach((module) => {
            // convert string _id to ObjectId for comparison if it exists
            const moduleObjectId = module._id ? new mongoose_1.Types.ObjectId(module._id) : null;
            const indexToUpdate = findMatchingModuleIndex(user.completedModules, module, moduleObjectId);
            if (indexToUpdate > -1) {
                // update existing module for the current semester
                Object.assign(user.completedModules[indexToUpdate], module);
            }
            else {
                // add new module
                if (!user.completedModules.some((existingMod) => (moduleObjectId === null || moduleObjectId === void 0 ? void 0 : moduleObjectId.toString()) &&
                    existingMod._id &&
                    moduleObjectId.toString() === existingMod._id.toString())) {
                    user.completedModules.push(module);
                }
            }
        });
        const result = await user.save();
        const userClient = await transformUserStudypath(result);
        res.status(200).json(userClient.studypath);
    }
    catch (error) {
        next(new error_1.BadRequestError("Studienverlauf konnte nicht aktualisiert werden"));
    }
}
// semester transition, adding modules of one semester to study path
async function finishSemester(req, res, next) {
    const userReq = req.user;
    const modulesToUpdate = req.body.completedModules;
    const modulesToDrop = req.body.droppedModules;
    if (!userReq._id || !Array.isArray(modulesToUpdate)) {
        return next(new error_1.BadRequestError("Ungültige Parameter"));
    }
    try {
        const user = await mongo_1.User.findById(userReq._id);
        if (!user) {
            return next(new error_1.NotFoundError("Nutzer wurde nicht gefunden"));
        }
        if (!user.completedModules) {
            user.completedModules = [];
        }
        // remove the modules from the semester which should not land in the finished semester
        modulesToDrop.forEach((module) => {
            const moduleObjectId = module._id ? new mongoose_1.Types.ObjectId(module._id) : null;
            const indexToDelete = findMatchingModuleIndex(user.completedModules, module, moduleObjectId);
            if (indexToDelete > -1) {
                user.completedModules.splice(indexToDelete, 1);
            }
        });
        modulesToUpdate.forEach((module) => {
            const moduleObjectId = module._id ? new mongoose_1.Types.ObjectId(module._id) : null;
            const modulePassedInAnotherSemester = user.completedModules.some((existingMod) => !module.isUserGenerated &&
                existingMod.acronym === module.acronym &&
                existingMod.semester !== module.semester &&
                existingMod.status === "passed");
            // if it was passed in other semesters, remove it from the current semester
            if (modulePassedInAnotherSemester) {
                user.completedModules = user.completedModules.filter((existingMod) => {
                    return !(existingMod.semester === module.semester &&
                        (((moduleObjectId === null || moduleObjectId === void 0 ? void 0 : moduleObjectId.toString()) &&
                            existingMod._id &&
                            moduleObjectId.toString() === existingMod._id.toString()) ||
                            (!module.isUserGenerated &&
                                existingMod.acronym === module.acronym)));
                });
                return;
            }
            const indexToUpdate = findMatchingModuleIndex(user.completedModules, module, moduleObjectId);
            if (indexToUpdate > -1) {
                // update existing module for the current semester
                Object.assign(user.completedModules[indexToUpdate], module);
            }
            else {
                // add new module
                if (!user.completedModules.some((existingMod) => (moduleObjectId === null || moduleObjectId === void 0 ? void 0 : moduleObjectId.toString()) &&
                    existingMod._id &&
                    moduleObjectId.toString() === existingMod._id.toString())) {
                    if (!module._id || module._id === null) {
                        module._id = new mongoose_1.Types.ObjectId().toString();
                    }
                    user.completedModules.push({ ...module });
                }
            }
        });
        const result = await user.save();
        const userClient = await transformUserStudypath(result);
        res.status(200).json(userClient.studypath);
    }
    catch (error) {
        next(new error_1.BadRequestError("Semester konnte nicht zum Studienverlauf hinzugefügt werden."));
    }
}
// helper function for finish semester - find matching module index
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
/** Update of competence aims in database
 * @param req contains aims in form of CompAim[] and uId to validate user
 * @param res
 * @param next */
async function updateCompetenceAims(req, res, next) {
    const user = req.user;
    const aims = req.body.aims;
    if (user._id && aims) {
        try {
            const update = await mongo_1.User.updateOne({ _id: user._id }, { compAims: aims }).exec();
            if (update.modifiedCount > 0) {
                res
                    .status(200)
                    .json("Die Kompetenzziele wurden erfolgreich aktualisiert.");
            }
            else {
                next(new error_1.BadRequestError("Es ist etwas schief gegangen..."));
            }
        }
        catch (error) {
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind unvollständig oder ungültig."));
    }
}
async function deleteModuleFromStudypath(req, res, next) {
    const id = typeof req.body.id == "string" ? req.body.id : undefined;
    const semester = (0, customValidator_1.validateAndReturnSemester)(req.body.semester);
    const userReq = req.user;
    if (id && semester && userReq._id) {
        try {
            // find user
            const user = await mongo_1.User.findById(userReq._id);
            if (user) {
                const index = user.completedModules.findIndex((el) => el._id == id);
                user.completedModules.splice(index, 1);
                const result = await user.save();
                const userClient = await transformUserStudypath(result);
                res.status(200).json(userClient.studypath);
            }
            else {
                next(new error_1.NotFoundError("Es wurde kein vergangenes Semester gefunden."));
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
async function deleteStudypath(req, res, next) {
    const user = req.user;
    try {
        if (user.completedModules) {
            const result = await mongo_1.User.updateOne({ _id: user._id }, {
                $set: {
                    completedModules: [],
                },
            });
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Kein passender Nutzer gefunden"));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError());
    }
}
async function deleteFavouriteModules(req, res, next) {
    try {
        const user = req.user;
        if (user && user.favouriteModulesAcronyms) {
            const result = await mongo_1.User.updateOne({ _id: user._id }, {
                $set: {
                    favouriteModulesAcronyms: [],
                },
            });
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Kein passender Nutzer gefunden"));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError());
    }
}
async function deleteNotInterestingModules(req, res, next) {
    try {
        const user = req.user;
        if (user && user.notInterestingModulesAcronyms) {
            const result = await mongo_1.User.updateOne({ _id: user._id }, {
                $set: {
                    notInterestingModulesAcronyms: [],
                },
            });
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Kein passender Nutzer gefunden"));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError());
    }
}
async function deleteNotInterestingModule(req, res, next) {
    const acronym = typeof req.params.acronym == "string" ? req.params.acronym : undefined;
    const user = req.user;
    try {
        if (acronym && user && user.notInterestingModulesAcronyms) {
            const result = await mongo_1.User.updateOne({ _id: user._id }, {
                $pull: {
                    notInterestingModulesAcronyms: acronym,
                },
            });
            res.status(200).json(result);
        }
        else {
            next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError("Beim Löschen des Moduls ist ein Fehler aufgetreten."));
    }
}
async function updateDashboardView(req, res, next) {
    const userReq = req.user;
    const name = validator_1.default.isAlpha(String(req.body.chartName), undefined, {
        ignore: "-",
    })
        ? req.body.chartName
        : undefined;
    if (userReq._id && name) {
        const user = await mongo_1.User.findById(userReq._id);
        if (user) {
            const chart = user.dashboardSettings.find((el) => el.key == name);
            if (chart) {
                chart.visible = !chart.visible;
                const result = await user.save();
                res.status(200).send(result.dashboardSettings);
            }
            else {
                next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
            }
        }
        else {
            next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
// TODO: currently just updates current setting, extend if needed
async function updateTimetableSettings(req, res, next) {
    const userReq = req.user;
    const showWeekends = Boolean(req.body.showWeekends);
    try {
        const user = await mongo_1.User.findById(userReq._id);
        if (user) {
            let setting = user.timetableSettings.find((el) => "showWeekends" in el);
            if (setting) {
                setting.showWeekends = showWeekends;
            }
            else {
                // add showWeekends setting if it does not exist
                user.timetableSettings.push({ showWeekends });
            }
            const result = await user.save();
            res.status(200).send(result.timetableSettings);
        }
        else {
            next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
        }
    }
    catch (error) {
        next(new error_1.BadRequestError());
    }
}
async function updateFavouriteModules(req, res, next) {
    const userReq = req.user;
    const acronym = typeof req.body.acronym == "string" ? req.body.acronym : undefined;
    if (userReq._id && acronym) {
        const user = await mongo_1.User.findById(userReq._id);
        if (user) {
            const index = user.favouriteModulesAcronyms.indexOf(acronym);
            if (index === -1) {
                // add module if it is not a favourite yet
                user.favouriteModulesAcronyms.push(acronym);
            }
            else {
                // delete module if it is already there
                user.favouriteModulesAcronyms.splice(index, 1);
            }
            const result = await user.save();
            res.status(200).send(result.favouriteModulesAcronyms);
        }
        else {
            next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
        }
    }
    else {
        next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
    }
}
async function updateNotInterestingModule(req, res, next) {
    const user = req.user;
    const acronym = typeof req.body.acronym == "string" ? req.body.acronym : undefined;
    if (user._id && acronym) {
        const userDb = await mongo_1.User.findById(user._id);
        if (userDb) {
            const index = user.notInterestingModulesAcronyms.indexOf(acronym);
            if (index === -1) {
                // add module if it is not a favourite yet
                userDb.notInterestingModulesAcronyms.push(acronym);
            }
            else {
                // delete module if it is already there
                userDb.notInterestingModulesAcronyms.splice(index, 1);
            }
            const result = await userDb.save();
            res.status(200).send(result.notInterestingModulesAcronyms);
        }
        else {
            next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
        }
    }
    else {
        next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
    }
}
async function toggleTopic(req, res, next) {
    const user = req.user;
    const topic = req.body.topic;
    if (user._id && topic) {
        try {
            const userDocument = await mongo_1.User.findById(user._id)
                .select("topics")
                .exec();
            const updateOperation = (userDocument === null || userDocument === void 0 ? void 0 : userDocument.topics.includes(topic))
                ? { $pull: { topics: topic } } // remove if exists
                : { $addToSet: { topics: topic } }; // add if does not exist
            await mongo_1.User.updateOne({ _id: user._id }, updateOperation).exec();
            const updatedUser = await mongo_1.User.findById(user._id).select("topics").exec();
            res.status(200).json({ topics: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.topics });
        }
        catch (error) {
            next(new error_1.BadRequestError("Thema konnte nicht aktualisiert werden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function updateHint(req, res, next) {
    const userReq = req.user;
    const key = typeof req.body.key == "string" ? req.body.key : undefined;
    const hasConfirmed = Boolean(req.body.hasConfirmed);
    if (userReq._id && key && hasConfirmed) {
        const user = await mongo_1.User.findById(userReq._id);
        if (user && user.hints) {
            const hintIndex = user.hints.findIndex((hint) => hint.key === key);
            if (hintIndex !== -1) {
                user.hints[hintIndex].hasConfirmed = hasConfirmed;
                await user.save();
                res.status(200).send(user.hints);
            }
            else {
                res.status(404).send("Hinweis nicht gefunden");
            }
        }
        else {
            next(new error_1.NotFoundError("Nutzer wurde nicht gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function addConsents(req, res, next) {
    const userReq = req.user;
    const ctype = typeof req.body.ctype === "string" ? req.body.ctype.trim() : undefined;
    const hasConfirmed = Boolean(req.body.hasConfirmed);
    const hasResponded = req.body.hasResponded !== undefined ? Boolean(req.body.hasResponded) : true; // default is true here (we're obviously updating)
    const timestamp = req.body.timestamp
        ? new Date(req.body.timestamp)
        : undefined;
    if (userReq._id &&
        ctype !== undefined &&
        hasConfirmed !== undefined &&
        timestamp !== undefined) {
        try {
            const user = await mongo_1.User.findById(userReq._id);
            if (user) {
                const newConsent = {
                    ctype: ctype,
                    hasConfirmed: hasConfirmed,
                    hasResponded: hasResponded,
                    timestamp: timestamp,
                };
                user.consents.push(newConsent);
                await user.save();
                res.status(200).send(user.consents);
            }
            else {
                res.status(404).send("Nutzer wurde nicht gefunden.");
            }
        }
        catch (error) {
            next(new error_1.BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function updateModuleFeedback(req, res, next) {
    const userReq = req.user;
    const feedback = req.body.feedback;
    if (!userReq._id || !(feedback === null || feedback === void 0 ? void 0 : feedback.acronym)) {
        return next(new error_1.BadRequestError("Ungültige Eingabedaten."));
    }
    try {
        const user = await mongo_1.User.findById(userReq._id);
        if (!user) {
            return res.status(404).send("Nutzer wurde nicht gefunden.");
        }
        if (!user.moduleFeedback) {
            user.moduleFeedback = [];
        }
        // existing feedback?
        const existingFeedbackIndex = user.moduleFeedback.findIndex((mf) => mf.acronym === feedback.acronym);
        // update changed properties
        if (existingFeedbackIndex > -1) {
            // Update only the properties that are different, excluding the acronym
            const existingFeedback = user.moduleFeedback[existingFeedbackIndex];
            const ratings = [
                "similarmods",
                "similarchair",
                "priorknowledge",
                "contentmatch",
            ];
            ratings.forEach((key) => {
                if (feedback[key] !== undefined &&
                    feedback[key] !== existingFeedback[key]) {
                    existingFeedback[key] = feedback[key];
                }
            });
        }
        else {
            user.moduleFeedback.push(feedback);
        }
        await user.save();
        res.status(200).send(user.moduleFeedback);
    }
    catch (error) {
        console.error("Error updating module feedback:", error);
        next(new error_1.BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
    }
}
async function deleteModuleFeedback(req, res, next) {
    const userReq = req.user;
    const feedback = req.body.feedback;
    if (!userReq._id || !(feedback === null || feedback === void 0 ? void 0 : feedback.acronym)) {
        return next(new error_1.BadRequestError("Ungültige Eingabedaten."));
    }
    try {
        const user = await mongo_1.User.findById(userReq._id);
        if (!user) {
            return res.status(404).send("Nutzer wurde nicht gefunden.");
        }
        if (!user.moduleFeedback) {
            user.moduleFeedback = [];
        }
        // remove feedback for the given acronym
        user.moduleFeedback = user.moduleFeedback.filter((mf) => mf.acronym !== feedback.acronym);
        await user.save();
        res.status(200).send(user.moduleFeedback);
    }
    catch (error) {
        next(new error_1.BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
    }
}
async function addInterest(req, res, next) {
    const userReq = req.user;
    const interest = validator_1.default.isAlphanumeric(String(req.body.interest), "de-DE", { ignore: " .!?äöüß" })
        ? req.body.interest
        : undefined;
    if (userReq._id && interest) {
        const user = await mongo_1.User.findById(userReq._id);
        if (user && user.interests) {
            user.interests.push(interest);
            await user.save();
            res.status(200).send(user.interests);
        }
        else {
            next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind unvollständig."));
    }
}
async function deleteInterest(req, res, next) {
    const userReq = req.user;
    const interest = validator_1.default.isAlphanumeric(String(req.body.interest), "de-DE", { ignore: " .!?äöüß" })
        ? req.body.interest
        : undefined;
    if (userReq._id && interest) {
        const user = await mongo_1.User.findById(userReq._id);
        if (user && user.interests) {
            const index = user.interests.indexOf(interest);
            user.interests.splice(index, 1);
            await user.save();
            res.status(200).json(user.interests);
        }
        else {
            next(new error_1.NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind unvollständig."));
    }
}
async function deleteJob(req, res, next) {
    const user = req.user;
    const jobId = (0, customValidator_1.validateObjectId)(req.body.id) ? req.body.id : undefined;
    if (jobId) {
        try {
            // delete job from user
            await mongo_1.User.findOneAndUpdate({ _id: user._id }, { $pull: { jobs: { _id: jobId } } });
            // delete job from recommendation
            const recommendation = await mongo_1.Recommendation.findOne({ userId: user._id });
            if (recommendation && recommendation.recommendedMods) {
                recommendation.recommendedMods.forEach((mod) => {
                    mod.source = mod.source.filter((source) => source.identifier !== jobId);
                });
                recommendation.recommendedMods = recommendation.recommendedMods.filter((mod) => mod.source.length > 0);
                await recommendation.save();
            }
            return res.status(200).json("Job deleted successfully.");
        }
        catch (error) {
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.NotFoundError("No valid job id found!"));
    }
}
async function deleteUser(req, res, next) {
    let user = req.user;
    let shibId = undefined;
    if (user && user.shibId) {
        shibId = user.shibId;
    }
    if (shibId) {
        const user = await mongo_1.User.findOne().byShibId(shibId);
        if (user) {
            try {
                const deletedStudyplans = await mongo_1.Studyplan.deleteMany({
                    userId: user._id,
                });
                const deletedSemesterplans = await mongo_1.Semesterplan.deleteMany({
                    userId: user._id,
                });
                const deletedRecommendations = await mongo_1.Recommendation.deleteMany({
                    userId: user._id,
                });
                const deletedUser = await mongo_1.User.findByIdAndDelete(user._id);
                if (deletedStudyplans && deletedUser && deletedSemesterplans && deletedRecommendations) {
                    res.status(200).json("Der Nutzer wurde gelöscht!");
                }
                else {
                    next(new error_1.BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
                }
            }
            catch (error) {
                next(new error_1.BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
            }
        }
        else {
            next(new error_1.NotFoundError("Es wurde kein Nutzer gefunden."));
        }
    }
    else {
        next(new error_1.BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
    }
}
/* Helper Function to get studypath (TODO: Work on later!!!) */
/* async function getStudypath(uId: string, semester: string): Promise<Studypath> {
  return new Promise(async (resolve, reject) => {
    const user = await User.findById(uId);
    if(user && user.studypath) {
 
    }
  })
} */
async function transformUserStudypath(user) {
    const completedModules = user.completedModules ? user.completedModules : [];
    let completedCourses = [];
    const studyplans = await mongo_1.Studyplan.find({
        userId: user._id,
    });
    if (studyplans) {
        const semesterplans = studyplans.map((el) => el.semesterPlans).flat(1);
        if (semesterplans) {
            for (const semplan of semesterplans) {
                const semester = semplan.semester;
                for (let course of semplan.courses) {
                    completedCourses.push({
                        id: course.id,
                        name: course.name,
                        status: course.status,
                        ects: course.ects,
                        sws: course.sws,
                        contributeTo: course.contributeTo,
                        contributeAs: course.contributeAs,
                        semester,
                    });
                }
            }
        }
    }
    const jobs = await transformJobs(user._id, user.jobs);
    return new Promise((resolve, reject) => {
        resolve({
            _id: user._id,
            shibId: user.shibId,
            roles: user.roles,
            authType: user.authType,
            interests: user.interests,
            compAims: user.compAims,
            startSemester: user.startSemester,
            duration: user.duration,
            maxEcts: user.maxEcts,
            sps: user.sps,
            fulltime: user.fulltime,
            dashboardSettings: user.dashboardSettings,
            timetableSettings: user.timetableSettings,
            favouriteModulesAcronyms: user.favouriteModulesAcronyms,
            notInterestingModulesAcronyms: user.notInterestingModulesAcronyms,
            hints: user.hints,
            consents: user.consents,
            topics: user.topics,
            moduleFeedback: user.moduleFeedback,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            studypath: {
                completedModules,
                completedCourses,
            },
            jobs: jobs,
        });
    });
}
async function transformJobs(userId, jobs) {
    var _a;
    if (jobs) {
        const recModules = await mongo_1.Recommendation.findOne({ userId });
        const transformedJobs = [];
        if (recModules) {
            for (const job of jobs) {
                const jobModules = (_a = recModules.recommendedMods) === null || _a === void 0 ? void 0 : _a.filter((mod) => {
                    return mod.source.find((source) => source.identifier === job._id.toString())
                        ? true
                        : false;
                });
                if (jobModules) {
                    transformedJobs.push({
                        _id: job._id,
                        title: job.title,
                        description: job.description,
                        inputMode: job.inputMode,
                        keywords: job.keywords,
                        embeddingId: job.embeddingId,
                        recModules: jobModules,
                    });
                }
            }
            return transformedJobs;
        }
        else {
            return jobs.map((job) => {
                return {
                    _id: job._id,
                    title: job.title,
                    description: job.description,
                    inputMode: job.inputMode,
                    keywords: job.keywords,
                    embeddingId: job.embeddingId,
                    recModules: [],
                };
            });
        }
    }
    else {
        return [];
    }
}
async function crawlStudentDataViaFlexNow(req, res, next) {
    try {
        const baId = 'ba2fv5'; //decrypt((req.session as any).passport.user.baId);
        const url = process.env.FN_STUDENT_URL
            ? process.env.FN_STUDENT_URL + baId
            : "";
        const importStudypath = req.body.importStudypath;
        if (url) {
            // read test xml file
            /* const result = fs.readFileSync(
              __dirname + "../../../../staticdata/dummy_student.xml",
              "utf8"
            ); */
            const result = await new Promise((resolve, reject) => {
                const data = new URLSearchParams();
                data.append("login", process.env.FLEXNOW_LOGIN ? process.env.FLEXNOW_LOGIN : "");
                data.append("password", process.env.FLEXNOW_PW ? process.env.FLEXNOW_PW : "");
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                };
                const req = https_1.default.request(url, options, (res) => {
                    const chunks = [];
                    res.on("data", (chunk) => {
                        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "binary"));
                    });
                    res.on("end", () => {
                        if (res.statusCode === 200) {
                            console.log("FlexNow Request with baId successful " + baId);
                            const buffer = Buffer.concat(chunks);
                            const ansiString = buffer.toString("binary");
                            resolve(ansiString);
                        }
                        else {
                            reject(new Error(`Request failed with status code ${res.statusCode}`));
                        }
                    });
                });
                req.on("error", (e) => {
                    reject(e);
                });
                req.write(data.toString());
                req.end();
            });
            const metadata = await (0, camaro_1.transform)(result, student_fn2api_1.metaDataTemplate);
            const studypath = importStudypath ? await (0, camaro_1.transform)(result, student_fn2api_1.studypathTemplate) : undefined;
            res.json({
                metadata,
                studypath
            });
        }
        else {
            res.status(404);
        }
    }
    catch (error) {
        next(error);
    }
}
