"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCronjobLogs = getCronjobLogs;
exports.getErrorLogs = getErrorLogs;
exports.getAllAcademicDates = getAllAcademicDates;
exports.addAcademicDate = addAcademicDate;
exports.updateAcademicDate = updateAcademicDate;
exports.deleteAcademicDate = deleteAcademicDate;
exports.addDateType = addDateType;
exports.updateDateType = updateDateType;
exports.deleteDateType = deleteDateType;
exports.getConnectedCoursesForModule = getConnectedCoursesForModule;
exports.initConnectionModulecourse2Course = initConnectionModulecourse2Course;
exports.createCourseToModuleConnection = createCourseToModuleConnection;
exports.deleteCourseToModuleConnection = deleteCourseToModuleConnection;
exports.crawlCourses = crawlCourses;
exports.crawlFN2Modules = crawlFN2Modules;
exports.addModuleStructureToDatabase = addModuleStructureToDatabase;
exports.updateModuleEmbeddings = updateModuleEmbeddings;
exports.initTopicsFromJSON = initTopicsFromJSON;
exports.getReporting = getReporting;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const error_1 = require("../../shared/error");
const validator_1 = __importDefault(require("validator"));
const customValidator_1 = require("../../shared/customValidator");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const univisHelpers_1 = require("../../shared/univisHelpers");
const univisCrawler_1 = require("../../shared/univisCrawler");
const camaro_1 = require("camaro");
const mhb_fn2mod_1 = require("../../templates/mhb_fn2mod");
const mongo_1 = require("../../database/mongo");
const https_1 = __importDefault(require("https"));
const fn2modHelper_1 = require("../../shared/fn2modHelper");
const router = express_1.default.Router();
router.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
// request to get the logs of the cronjob
async function getCronjobLogs(req, res, next) {
    try {
        // read and deliver json file
        const filePath = path_1.default.join(__dirname, "../../logs", "cronjob.log");
        const logData = await fs.promises.readFile(filePath, "utf-8");
        // Convert log data into JSON format (array of log entries)
        const logEntries = logData
            .split("\n")
            .filter(Boolean)
            .map((line) => JSON.parse(line))
            .splice(-500);
        res.json(logEntries);
    }
    catch (err) {
        (0, error_1.logError)(err);
        next(new error_1.BadRequestError("Fehler beim Lesen der Logdatei"));
    }
}
async function getErrorLogs(req, res, next) {
    try {
        // read and deliver json file
        const filePath = path_1.default.join(__dirname, "../../logs", "error.log");
        const logData = await fs.promises.readFile(filePath, "utf-8");
        // Convert log data into JSON format (array of log entries)
        const logEntries = logData
            .split("\n")
            .filter(Boolean)
            .map((line) => JSON.parse(line))
            .splice(-500);
        res.json(logEntries);
    }
    catch (err) {
        (0, error_1.logError)(err);
        next(new error_1.BadRequestError("Fehler beim Lesen der Logdatei"));
    }
}
// requests for academic dates
async function getAllAcademicDates(req, res, next) {
    try {
        const academicDates = await prisma.academicDate.findMany({
            include: {
                dateType: true,
            },
        });
        res.status(200).json(academicDates);
    }
    catch (error) {
        (0, error_1.logError)(error);
        next(new error_1.BadRequestError());
    }
}
async function addAcademicDate(req, res, next) {
    const desc = validator_1.default.isAlphanumeric(req.body.desc, "de-DE", {
        ignore: " .!?äöüß,",
    })
        ? req.body.desc
        : "";
    const startdate = validator_1.default.isDate(req.body.startdate)
        ? req.body.startdate
        : undefined;
    const enddate = validator_1.default.isDate(req.body.enddate)
        ? req.body.enddate
        : undefined;
    const starttime = validator_1.default.isTime(req.body.starttime)
        ? req.body.starttime
        : undefined;
    const endtime = validator_1.default.isTime(req.body.endtime)
        ? req.body.endtime
        : undefined;
    const datetypeId = validator_1.default.isNumeric(String(req.body.datetypeId))
        ? req.body.datetypeId
        : undefined;
    const semester = (0, customValidator_1.validateAndReturnSemester)(req.body.semester);
    if (startdate && enddate && datetypeId && semester) {
        try {
            const result = await prisma.academicDate.create({
                data: {
                    startdate: new Date(startdate),
                    enddate: new Date(enddate),
                    starttime,
                    endtime,
                    semester,
                    desc,
                    typeId: datetypeId,
                },
                include: {
                    dateType: true,
                },
            });
            res.status(200).json(result);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function updateAcademicDate(req, res, next) {
    const id = validator_1.default.isNumeric(String(req.body.id)) ? req.body.id : undefined;
    const desc = validator_1.default.isAlphanumeric(req.body.desc, "de-DE", {
        ignore: " .!?äöüß,",
    })
        ? req.body.desc
        : "";
    const startdate = validator_1.default.isDate(req.body.startdate)
        ? req.body.startdate
        : undefined;
    const enddate = validator_1.default.isDate(req.body.enddate)
        ? req.body.enddate
        : undefined;
    const starttime = validator_1.default.isTime(req.body.starttime)
        ? req.body.starttime
        : undefined;
    const endtime = validator_1.default.isTime(req.body.endtime)
        ? req.body.endtime
        : undefined;
    const datetypeId = validator_1.default.isNumeric(String(req.body.datetypeId))
        ? req.body.datetypeId
        : undefined;
    const semester = (0, customValidator_1.validateAndReturnSemester)(req.body.semester);
    if (id && startdate && enddate && datetypeId && semester) {
        try {
            const result = await prisma.academicDate.update({
                where: {
                    id,
                },
                data: {
                    startdate: new Date(startdate),
                    enddate: new Date(enddate),
                    starttime,
                    endtime,
                    semester,
                    desc,
                    typeId: datetypeId,
                },
                include: {
                    dateType: true,
                },
            });
            res.status(200).json(result);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function deleteAcademicDate(req, res, next) {
    const id = validator_1.default.isNumeric(req.params.id)
        ? Number(req.params.id)
        : undefined;
    if (id) {
        try {
            const result = await prisma.academicDate.delete({
                where: {
                    id,
                },
            });
            res.status(200).json(result);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Fehler beim Löschen des Datums"));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
async function addDateType(req, res, next) {
    const name = validator_1.default.isAlphanumeric(req.body.name, "de-DE", {
        ignore: " .!?äöüß,",
    })
        ? req.body.name
        : undefined;
    const desc = validator_1.default.isAlphanumeric(req.body.desc, "de-DE", {
        ignore: " .!?äöüß,",
    })
        ? req.body.desc
        : "";
    if (name) {
        try {
            const result = await prisma.dateType.create({
                data: {
                    name,
                    desc,
                },
            });
            res.status(200).json(result);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Fehler beim Hinzufügen des Datentyps"));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
async function updateDateType(req, res, next) {
    const id = validator_1.default.isNumeric(String(req.body.id))
        ? Number(req.body.id)
        : undefined;
    const name = validator_1.default.isAlphanumeric(req.body.name, "de-DE", {
        ignore: " .!?äöüß,",
    })
        ? req.body.name
        : undefined;
    const desc = validator_1.default.isAlphanumeric(req.body.desc, "de-DE", {
        ignore: " .!?äöüß,",
    })
        ? req.body.desc
        : "";
    if (name) {
        try {
            const result = await prisma.dateType.update({
                where: {
                    typeId: id,
                },
                data: {
                    name,
                    desc,
                },
            });
            res.status(200).json(result);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Fehler beim Aktualisieren des Datentyps"));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
async function deleteDateType(req, res, next) {
    const id = validator_1.default.isNumeric(String(req.params.id))
        ? Number(req.params.id)
        : undefined;
    if (id) {
        try {
            const result = await prisma.dateType.delete({
                where: {
                    typeId: id,
                },
            });
            res.status(200).json(result);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Fehler beim Löschen des Datentyps"));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
async function getConnectedCoursesForModule(req, res, next) {
    const moduleId = validator_1.default.isAlphanumeric(req.params.id, undefined, {
        ignore: "_-",
    })
        ? req.params.id
        : undefined;
    const version = validator_1.default.isInt(req.params.version)
        ? Number(req.params.version)
        : undefined;
    const semester = (0, customValidator_1.validateAndReturnSemester)(req.params.semester);
    if (moduleId && version && semester) {
        try {
            const moduleCourses = await prisma.mod2ModCourse.findMany({
                include: {
                    mCourse: true,
                },
                where: {
                    AND: [
                        {
                            mId: moduleId,
                        },
                        {
                            mVersion: version,
                        },
                    ],
                },
            });
            if (moduleCourses) {
                let courses = [];
                for (let mCourse of moduleCourses) {
                    const connectedCourses = await prisma.course2ModuleCourse.findMany({
                        include: {
                            course: true,
                            modCourse: true,
                        },
                        where: {
                            AND: [
                                {
                                    mcId: mCourse.mcId,
                                },
                                {
                                    semester: semester,
                                },
                            ],
                        },
                    });
                    if (connectedCourses) {
                        courses = courses.concat([...connectedCourses]);
                    }
                }
                res.json(courses);
            }
            else {
                next(new error_1.NotFoundError("Es konnte zu dem Modul keine Modulkurse gefunden werden!"));
            }
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Fehler beim Abrufen der Modulkurse"));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
async function initConnectionModulecourse2Course(req, res, next) {
    let messages = [];
    let startTime = Date.now();
    try {
        const moduleCourses = await prisma.moduleCourse.findMany({
            include: {
                modules: {
                    select: {
                        acronym: true,
                    },
                },
            },
        });
        const template = [];
        if (moduleCourses) {
            for (let mc of moduleCourses) {
                let name;
                let acronym;
                if (typeof mc.identifier === "object" && mc.identifier) {
                    for (let [key, value] of Object.entries(mc.identifier)) {
                        if (key == "name") {
                            name = value ? value.toString() : "";
                        }
                        if (key == "acronym") {
                            acronym = value ? value.toString() : mc.modules[0].acronym;
                        }
                    }
                }
                else {
                    name = undefined;
                    acronym = mc.modules[0].acronym;
                }
                if (acronym) {
                    const courses = await prisma.course.findMany({
                        where: {
                            OR: [
                                {
                                    // checks if acronym is contained and type is same
                                    AND: [
                                        {
                                            short: {
                                                contains: acronym,
                                            },
                                        },
                                        {
                                            type: {
                                                contains: mc.type,
                                            },
                                        },
                                    ],
                                },
                                {
                                    AND: [
                                        {
                                            name: {
                                                contains: acronym,
                                            },
                                        },
                                        {
                                            type: {
                                                contains: mc.type,
                                            },
                                        },
                                    ],
                                },
                                {
                                    // checks if organizatinal contains acronym, name of module is contained in course name and type is the same
                                    AND: [
                                        {
                                            organizational: {
                                                contains: acronym,
                                            },
                                        },
                                        {
                                            type: {
                                                contains: mc.type,
                                            },
                                        },
                                        {
                                            name: {
                                                contains: name,
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    });
                    if (courses) {
                        for (let course of courses) {
                            template.push({
                                mcId: mc.mcId,
                                cId: course.id,
                                semester: course.semester,
                            });
                        }
                    }
                }
            }
            if (template.length == 0) {
                next(new error_1.NotFoundError("Keine Einträge zum Hinzufügen"));
            }
            else {
                const result = await prisma.course2ModuleCourse.createMany({
                    data: template,
                    skipDuplicates: true,
                });
                let difference = ((Date.now() - startTime) / 1000) | 0;
                let minutes = (difference / 60) | 0;
                let seconds = difference - minutes * 60;
                messages.push(`${minutes} Minutes and ${seconds} Seconds to process`);
                messages.push(`${result.count} Connections made`);
                res.status(200).send(messages);
            }
        }
        else {
            next(new error_1.NotFoundError("Es liegen noch keine Modullehrveranstaltungen vor!"));
        }
    }
    catch (error) {
        (0, error_1.logError)(error);
        next(new error_1.BadRequestError("Fehler beim Initialisieren der Verbindung"));
    }
}
async function createCourseToModuleConnection(req, res, next) {
    const mcId = validator_1.default.isAlphanumeric(req.body.mcId, "de-DE", { ignore: "-" })
        ? req.body.mcId
        : undefined;
    const cId = validator_1.default.isAlphanumeric(req.body.cId, "de-DE", { ignore: "_." })
        ? req.body.cId
        : undefined;
    const semester = (0, customValidator_1.validateAndReturnSemester)(req.body.semester);
    if (mcId && cId && semester) {
        try {
            // create connection
            await prisma.course2ModuleCourse.create({
                data: {
                    mcId,
                    cId,
                    semester,
                },
            });
            res.status(200).json("Die Modulverbindung wurde hergestellt!");
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Fehler beim Erstellen der Verbindung"));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
async function deleteCourseToModuleConnection(req, res, next) {
    const mcId = validator_1.default.isAlphanumeric(req.params.mcId, "de-DE", {
        ignore: "-",
    })
        ? req.params.mcId
        : undefined;
    const cId = validator_1.default.isAlphanumeric(req.params.cId, "de-DE", {
        ignore: "_.",
    })
        ? req.params.cId
        : undefined;
    const semester = (0, customValidator_1.validateAndReturnSemester)(req.params.semester);
    if (mcId && cId && semester) {
        try {
            // delete connection
            await prisma.course2ModuleCourse.delete({
                where: {
                    mcId_cId_semester: {
                        mcId,
                        cId,
                        semester,
                    },
                },
            });
            res.status(200).json("Die Modulverbindung wurde erfolgreich gelöscht!");
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Fehler beim Löschen der Verbindung"));
        }
    }
    else {
        next(new error_1.BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
}
async function crawlCourses(req, res, next) {
    // check if semester input is valid
    const semester = (0, univisHelpers_1.checkSemester)(req.body.semester);
    if (semester) {
        (0, univisCrawler_1.processUnivisData)(semester)
            .then((message) => {
            res.status(200).send(message);
        })
            .catch((error) => {
            (0, error_1.logError)(error);
            next(error);
        });
    }
    else {
        next(new error_1.BadRequestError("Das übergebene Semester hat das falsche Format."));
    }
}
async function crawlFN2Modules(req, res, next) {
    const semester = (0, univisHelpers_1.checkSemester)(req.params.semester);
    if (semester) {
        let startTime = Date.now();
        let mhbs = '';
        try {
            mhbs = await crawlFlexNow(semester);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError("Fehler beim Crawlen der FlexNow-Daten"));
        }
        const result = await processFlexNowData(mhbs);
        let difference = ((Date.now() - startTime) / 1000) | 0;
        let minutes = (difference / 60) | 0;
        let seconds = difference - minutes * 60;
        result.push(`${minutes} Minutes and ${seconds} Seconds to process`);
        res.status(200).json(result);
    }
    else {
        next(new error_1.BadRequestError("Das übergebene Semester hat das falsche Format."));
    }
}
// Add a xml file containing module structure into the database
async function addModuleStructureToDatabase(req, res, next) {
    // typecheck body
    const xml = typeof req.body.xmltext == "string" ? req.body.xmltext : "";
    // check if xml starts and ends correct
    if (xml.startsWith("<Modulhandbuch") && xml.endsWith("</Modulhandbuch>")) {
        try {
            const result = await processFlexNowData(xml);
            if (result) {
                res.status(200).json(result);
            }
            else {
                next(new error_1.BadRequestError("Fehler beim Hinzufügen der Daten"));
            }
        }
        catch (error) {
            next(new error_1.BadRequestError("Fehler beim Hinzufügen der Daten"));
        }
    }
    else {
        next(new error_1.BadRequestError("Das XML hat das falsche Format."));
    }
}
/**
 * Update module embeddings with embedding vectors in JSON file
 */
async function updateModuleEmbeddings(req, res, next) {
    var _a, _b;
    try {
        const embeddingsFilePath = path_1.default.join(__dirname, "../../..", "staticdata", "module_embeddings.json");
        const fileData = await fs.promises.readFile(embeddingsFilePath, "utf8");
        const embeddings = JSON.parse(fileData);
        const promises = Object.entries(embeddings).map(async ([acronym, vector]) => {
            return mongo_1.ModEmbedding.findOneAndUpdate({ acronym }, // match by acronym
            { acronym, vector }, { upsert: true, new: true, setDefaultsOnInsert: true } // create new if does not exist
            );
        });
        const results = await Promise.all(promises);
        res.status(200).json({
            message: "Modulembeddings wurden aktualisiert.",
            count: results.length,
            firstVectorLength: ((_b = (_a = results[0]) === null || _a === void 0 ? void 0 : _a.vector) === null || _b === void 0 ? void 0 : _b.length) || 0,
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.BadRequestError("Modulembeddings konnte nicht aktualisiert werden."));
    }
}
/**
 * Initialize topics and embeddings from the JSON file containing topic vectors
 */
async function initTopicsFromJSON(req, res, next) {
    var _a;
    try {
        const topicsFilePath = path_1.default.join(__dirname, "../../..", "staticdata", "topic_embeddings.json");
        // parse JSON file
        const fileData = await fs.promises.readFile(topicsFilePath, "utf8");
        const topicsData = JSON.parse(fileData);
        // create parent topics
        const parentTopicNames = [
            ...new Set(topicsData.map((item) => item.parent)),
        ];
        const parentTopicsMap = new Map();
        for (const parentName of parentTopicNames) {
            let parentTopic = await mongo_1.TopicM.findOne({ name: parentName });
            if (!parentTopic) {
                parentTopic = await mongo_1.TopicM.create({
                    name: parentName,
                });
            }
            parentTopicsMap.set(parentName, parentTopic.tId);
        }
        const processedTopics = [];
        for (const topicData of topicsData) {
            const parentId = parentTopicsMap.get(topicData.parent);
            if (!parentId) {
                console.warn(`Parent not found for topic ${topicData.topic}`);
                continue;
            }
            // create/update the topic
            const topic = await mongo_1.TopicM.findOneAndUpdate({ name: topicData.topic }, {
                name: topicData.topic,
                description: topicData.description || `Themenbeschreibung zu ${topicData.topic}`,
                keywords: topicData.keywords,
                parentId: parentId,
            }, { upsert: true, new: true, setDefaultsOnInsert: true });
            let needsNewEmbedding = true;
            // update existing embedding if there is one
            if (topic.embeddingId) {
                const updatedEmbedding = await mongo_1.Embedding.findByIdAndUpdate(topic.embeddingId, {
                    identifier: topic.tId,
                    vector: topicData.vector,
                });
                if (updatedEmbedding) {
                    needsNewEmbedding = false;
                } // also create new Embedding if none was found
            }
            if (needsNewEmbedding) {
                const embedding = await mongo_1.Embedding.create({
                    identifier: topic.tId,
                    vector: topicData.vector,
                });
                topic.embeddingId = embedding._id;
                await topic.save();
            }
            processedTopics.push({
                tId: topic.tId,
                name: topic.name,
                parentId: topic.parentId,
                embeddingId: topic.embeddingId,
            });
        }
        res.status(200).json({
            message: "Topics and embeddings initialized successfully",
            processed: processedTopics.length,
            parentTopics: parentTopicNames.length,
            vectorDimension: (_a = topicsData[0]) === null || _a === void 0 ? void 0 : _a.vector.length,
        });
    }
    catch (error) {
        console.error("Error initializing topics:", error);
        next(new error_1.BadRequestError("Failed to initialize topics from JSON file"));
    }
}
async function getReporting(req, res, next) {
    try {
        // define helper variables
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        // request variables for report
        // count all users
        const allUsers = await mongo_1.User.countDocuments({});
        // count active users in the last month
        const activeUsers = await mongo_1.User.countDocuments({
            updatedAt: { $gte: oneMonthAgo },
        });
        // get cluster when users where last active
        const lastActiveUsersHistory = await mongo_1.User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$updatedAt" }, // Extrahiere das Jahr aus dem updatedAt-Feld
                        month: { $month: "$updatedAt" }, // Extrahiere den Monat aus dem updatedAt-Feld
                    },
                    count: { $sum: 1 }, // Zähle die Anzahl der Nutzer pro Monat und Jahr
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }, // Sortiere nach Jahr und Monat
            },
        ]);
        // count frequency of module status
        const frequencyModuleStatus = await mongo_1.User.aggregate([
            { $unwind: "$completedModules" },
            { $group: { _id: "$completedModules.status", count: { $sum: 1 } } },
        ]);
        // count frequency of studyprogrammes
        const frequencyStudyProgrammes = await mongo_1.User.aggregate([
            { $unwind: "$sps" },
            { $group: { _id: "$sps.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // count frequency of study duration
        const frequencyDuration = await mongo_1.User.aggregate([
            { $group: { _id: "$duration", count: { $sum: 1 } } },
        ]);
        // count frequency of startsemester
        const frequencyStartSemester = await mongo_1.User.aggregate([
            { $group: { _id: "$startSemester", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // count number of completed modules (clustered by 0, 1-5, 6-10 and 11+)
        const frequencyCompletedModules = await mongo_1.User.aggregate([
            {
                $addFields: {
                    moduleCount: { $size: { $ifNull: ["$completedModules", []] } },
                },
            },
            {
                $bucket: {
                    groupBy: "$moduleCount",
                    boundaries: [0, 1, 6, 11, Infinity],
                    default: "Unbekannt",
                    output: {
                        count: { $sum: 1 },
                    },
                },
            },
            {
                $addFields: {
                    label: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 0] }, then: "0 Module" },
                                {
                                    case: { $and: [{ $gte: ["$_id", 1] }, { $lt: ["$_id", 6] }] },
                                    then: "1-5 Module",
                                },
                                {
                                    case: {
                                        $and: [{ $gte: ["$_id", 6] }, { $lt: ["$_id", 11] }],
                                    },
                                    then: "6-10 Module",
                                },
                                { case: { $gte: ["$_id", 11] }, then: "11+ Module" },
                            ],
                            default: "Unbekannt",
                        },
                    },
                },
            },
        ]);
        // frequency of modules as completed module
        const frequencyModulesAsCompleted = await mongo_1.User.aggregate([
            { $unwind: "$completedModules" },
            { $group: { _id: "$completedModules.acronym", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // number of studyplans that where updated in the last month
        const frequencyStudyPlans = await mongo_1.Studyplan.countDocuments({
            updatedAt: { $gte: oneMonthAgo },
        });
        // cluster of how often studyplans where updated
        const frequencyStudyPlansClustered = await mongo_1.Studyplan.aggregate([
            {
                $bucket: {
                    groupBy: "$__v",
                    boundaries: [0, 1, 10, 50, Infinity],
                    default: "other",
                    output: { count: { $sum: 1 } },
                },
            },
            {
                $addFields: {
                    label: {
                        $switch: {
                            branches: [
                                {
                                    case: { $and: [{ $gte: ["$_id", 0] }, { $lt: ["$_id", 2] }] },
                                    then: "Version 0-1",
                                },
                                {
                                    case: {
                                        $and: [{ $gte: ["$_id", 1] }, { $lt: ["$_id", 11] }],
                                    },
                                    then: "Version 2-10",
                                },
                                {
                                    case: {
                                        $and: [{ $gte: ["$_id", 10] }, { $lt: ["$_id", 51] }],
                                    },
                                    then: "Version 11-50",
                                },
                                { case: { $gte: ["$_id", 50] }, then: "Version 51+ " },
                            ],
                            default: "Unbekannt",
                        },
                    },
                },
            },
        ]);
        // frequency of planned courses within semesterplan
        const frequencyPlannedCourses = await mongo_1.Studyplan.aggregate([
            { $unwind: "$semesterPlans" },
            { $unwind: "$semesterPlans.courses" },
            {
                $group: {
                    _id: {
                        id: "$semesterPlans.courses.id",
                        name: "$semesterPlans.courses.name",
                        semester: "$semesterPlans.semester",
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        // create json for report
        const result = {
            allUsers: allUsers,
            activeUsers: activeUsers,
            lastActiveUsersHistory: lastActiveUsersHistory.map((history) => ({
                name: `${history._id.month}.${history._id.year}`,
                count: history.count,
            })),
            frequencyModuleStatus: frequencyModuleStatus.map((status) => ({
                name: status._id,
                count: status.count,
            })),
            frequencyStudyProgrammes: frequencyStudyProgrammes.map((programme) => ({
                name: programme._id,
                count: programme.count,
            })),
            frequencyDuration: frequencyDuration.map((duration) => ({
                name: duration._id,
                count: duration.count,
            })),
            frequencyStartSemester: frequencyStartSemester.map((semester) => ({
                name: semester._id,
                count: semester.count,
            })),
            frequencyCompletedModules: frequencyCompletedModules.map((group) => ({
                name: group.label,
                count: group.count,
            })),
            frequencyModulesAsCompleted: frequencyModulesAsCompleted.map((module) => ({
                name: module._id,
                count: module.count,
            })),
            frequencyStudyPlans: frequencyStudyPlans,
            frequencyStudyPlansClustered: frequencyStudyPlansClustered.map((group) => ({
                name: group.label,
                count: group.count,
            })),
            frequencyPlannedCourses: frequencyPlannedCourses.map((course) => ({
                id: course._id.id,
                name: course._id.name,
                semester: course._id.semester,
                count: course.count,
            })),
        };
        res.status(200).json(result);
    }
    catch (error) {
        (0, error_1.logError)(error);
        next(new error_1.BadRequestError("Fehler beim Abrufen der Reporting-Daten"));
    }
}
async function crawlFlexNow(semester) {
    if (semester.endsWith("s")) {
        semester = semester.replace("s", "1");
    }
    else {
        semester = semester.replace("w", "2");
    }
    const url = process.env.FN_MHBS_URL + semester;
    let result = new Promise((resolve, reject) => {
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
    return result;
}
async function processFlexNowData(xml) {
    const dep = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.depTemplate);
    const persons = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.personTemplate);
    const sps = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.spTemplate);
    const mhbs = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.mhbTemplate);
    const mgs = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.mgTemplate);
    const modules = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.modTemplate);
    const mc = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.mcTemplate);
    const mhb2mg = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.mhb2mgTemplate);
    const mg2mg = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.mg2mgTemplate);
    const mg2mod = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.mg2modTemplate);
    const m2mc = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.m2mcTemplate);
    const per2mc = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.per2mcTemplate);
    const modExams = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.moduleExamTemplate);
    // module dependencies via own n:m relational table, currently not in use but available.
    const modDepend = await (0, camaro_1.transform)(xml, mhb_fn2mod_1.modDepTemplate);
    // add or update departments in database
    const depMessage = await (0, fn2modHelper_1.upsertDeparmtents)(dep);
    // add persons to database
    const personsMessage = await (0, fn2modHelper_1.upsertPersons)(persons);
    // add sp to database
    const spsMessage = await (0, fn2modHelper_1.upsertStudyprogrammes)(sps);
    // add modulehandbooks and beyond to database, only when adding sps not resulting in an error
    if (spsMessage.startsWith("ERROR")) {
        return [depMessage, personsMessage, spsMessage];
    }
    const mhbsMessage = await (0, fn2modHelper_1.upsertModulehandbooks)(mhbs);
    // add modulegroups to database
    const mgsMessage = await (0, fn2modHelper_1.upsertModuleGroups)(mgs);
    // add modules to database
    const modulesMessage = await (0, fn2modHelper_1.upsertModules)(modules);
    // add module exams to database, only when adding modules not resulting in an error
    if (modulesMessage.startsWith("ERROR")) {
        return [depMessage, personsMessage, spsMessage, mhbsMessage, mgsMessage, modulesMessage];
    }
    const modExamMessage = await (0, fn2modHelper_1.upsertModuleExams)(modExams);
    // add modulecourses to database
    const modCoursesMessage = await (0, fn2modHelper_1.upsertModuleCourses)(mc);
    // add modulehandbook2modulegroup to database, only when adding mhbs and mgs not resulting in an error
    if (mhbsMessage.startsWith("ERROR") ||
        mgsMessage.startsWith("ERROR")) {
        return [depMessage, personsMessage, spsMessage, mhbsMessage, mgsMessage, modulesMessage, modExamMessage, modCoursesMessage];
    }
    const resultMhb2Mg = await prisma.mhb2Mg.createMany({
        data: mhb2mg,
        skipDuplicates: true,
    });
    // add modulegroup2modulegroup to database, only when adding mgs not resulting in an error
    let resultMg2Mg = await prisma.mg2Mg.createMany({
        data: mg2mg,
        skipDuplicates: true,
    });
    // add modulegroup2module to database, only when adding mgs and modules not resulting in an error
    let resultMg2Mod = await prisma.mod2Mg.createMany({
        data: mg2mod,
        skipDuplicates: true,
    });
    // filter invalid values in m2mc connection
    for (let el of m2mc) {
        if (Number.isNaN(el.ects)) {
            el.ects = undefined;
        }
    }
    const resultMod2Mc = await prisma.mod2ModCourse.createMany({
        data: m2mc,
        skipDuplicates: true,
    });
    // module dependencies via own n:m relational table, currently not in use but available.
    const resultModDepend = await prisma.moduleDep.createMany({
        data: modDepend,
        skipDuplicates: true,
    });
    // add connection between persons and modulecourse from course starting
    // transform data, since multiple pIds are contained
    let person2ModCourse = [];
    for (let entry of per2mc) {
        //entry consists of pId-Array and mcId
        for (let pId of entry.pIds) {
            person2ModCourse.push({
                pId: pId,
                mcId: entry.mcId,
            });
        }
    }
    const resultPer2Mc = await prisma.person2ModCourse.createMany({
        data: person2ModCourse,
        skipDuplicates: true,
    });
    return [
        depMessage,
        personsMessage,
        spsMessage,
        mhbsMessage,
        mgsMessage,
        modulesMessage,
        modExamMessage,
        modCoursesMessage,
        `Modulehandbook2Modulegroup: ${mhb2mg.length} queried - ${resultMhb2Mg.count} added`,
        `Modulegroup2Modulegroup: ${mg2mg.length} queried - ${resultMg2Mg.count} added`,
        `Modulegroup2Module: ${mg2mod.length} queried - ${resultMg2Mod.count} added`,
        `Module2ModuleCourse: ${m2mc.length} queried - ${resultMod2Mc.count} added`,
        `Person2ModuleCourse: ${person2ModCourse.length} queried - ${resultPer2Mc.count} added`,
        `Module Dependencies: ${modDepend.length} queried - ${resultModDepend.count} added`,
    ];
}
