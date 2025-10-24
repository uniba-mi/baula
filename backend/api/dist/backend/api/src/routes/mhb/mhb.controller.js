"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMhbByIdAndVersion = getMhbByIdAndVersion;
exports.getModByAcronymAndVersion = getModByAcronymAndVersion;
exports.getAllModules = getAllModules;
exports.getAllCurrentModules = getAllCurrentModules;
const client_1 = require("@prisma/client");
const module_1 = require("../../../../../interfaces/module");
const validator_1 = __importDefault(require("validator"));
const error_1 = require("../../shared/error");
const moduleMapping_1 = require("../../shared/moduleMapping");
const moduleHelpers_1 = require("../../shared/moduleHelpers");
const prisma = new client_1.PrismaClient();
// Get mhb-structure from specific id
async function getMhbByIdAndVersion(req, res, next) {
    const mhbId = validator_1.default.isAlphanumeric(req.params.id, undefined, { ignore: '_-' }) ? req.params.id : undefined;
    const version = validator_1.default.isInt(req.params.version)
        ? parseInt(req.params.version)
        : undefined;
    if (mhbId && version) {
        const mhb = await (0, moduleHelpers_1.findAndBuildModulehandbookByIdAndVersion)(mhbId, version);
        if (mhb) {
            res.status(200).json(mhb);
        }
        else {
            next(new error_1.NotFoundError("Zu den übergebenen Daten wurde kein Modulhandbuch gefunden!"));
        }
    }
    else {
        next(new error_1.BadRequestError("Fehlerhafte Daten übergeben!"));
    }
}
// get module by acronym and version
async function getModByAcronymAndVersion(req, res, next) {
    const acronym = validator_1.default.isAlphanumeric(req.params.acronym, 'de-DE', { ignore: '-' }) ? req.params.acronym : undefined;
    const version = validator_1.default.isInt(req.params.version)
        ? parseInt(req.params.version)
        : undefined;
    let select = {
        mId: true,
        version: true,
        acronym: true,
        name: true,
        content: true,
        skills: true,
        addInfo: true,
        priorKnowledge: true,
        ects: true,
        term: true,
        recTerm: true,
        duration: true,
        chair: true,
        respPerson: true,
        prevModules: true,
        exams: true,
        offerBegin: true,
        offerEnd: true,
        workload: true,
    };
    if (acronym) {
        let module;
        if (version) {
            module = await prisma.module.findFirst({
                select,
                where: {
                    version,
                    acronym,
                }
            });
        }
        else {
            module = await prisma.module.findFirst({
                select,
                where: {
                    acronym
                }
            });
        }
        let modules = [];
        if (module) {
            modules.push(new module_1.Module(module.mId, module.version, module.acronym, module.name, module.content, module.skills, module.addInfo, module.priorKnowledge, module.ects, module.term, module.recTerm, module.duration, module.chair, module.respPerson, module.exams, module.prevModules, module.offerBegin, module.offerEnd, module.workload));
            await (0, moduleHelpers_1.addModuleCourses)(modules);
            await (0, moduleHelpers_1.addExtractedModules)(modules);
            await (0, moduleHelpers_1.addAllPriorModules)(modules);
            res.status(200).json(modules[0]);
        }
        else {
            next(new error_1.NotFoundError("Zur übergebenen ID und Version wurde kein Modul gefunden!"));
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function getAllModules(req, res, next) {
    prisma.module
        .findMany({
        include: {
            mCourses: {
                include: {
                    mCourse: {
                        select: {
                            mcId: true,
                            name: true,
                            type: true,
                        }
                    }
                }
            }
        }
    })
        .then((mod) => {
        if (mod.length !== 0) {
            const result = mod.map(module => {
                return {
                    ...module,
                    mCourses: module.mCourses.map(mCourse => mCourse.mCourse)
                };
            });
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Zur übergebenen ID und Version wurde kein Modul gefunden!"));
        }
    })
        .catch(() => {
        next(new error_1.BadRequestError());
    });
}
async function getAllCurrentModules(req, res, next) {
    prisma.module.findMany()
        .then((modules) => {
        if (modules.length !== 0) {
            const updatedModules = mapOldModuleToEquivalentModules(modules.map(module => module.acronym));
            const result = modules.filter(module => updatedModules.includes(module.acronym));
            res.status(200).json(result);
        }
        else {
            next(new error_1.NotFoundError("Zur übergebenen ID und Version wurde kein Modul gefunden!"));
        }
    })
        .catch(() => {
        next(new error_1.BadRequestError());
    });
}
// helper
function mapOldModuleToEquivalentModules(modules) {
    return modules.map(moduleAcronym => {
        const change = moduleMapping_1.moduleChanges.find(change => change.oldModuleAcronym === moduleAcronym);
        return change ? change.newModuleAcronym : moduleAcronym;
    });
}
