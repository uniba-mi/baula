"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueModules = getUniqueModules;
exports.getBilAppCourses = getBilAppCourses;
exports.getCompetenceAndModulesOfCourse = getCompetenceAndModulesOfCourse;
const client_1 = require("@prisma/client");
const error_1 = require("../../shared/error");
const validator_1 = __importDefault(require("validator"));
const prisma = new client_1.PrismaClient();
async function getUniqueModules(req, res, next) {
    const result = await prisma.module.findMany({
        select: {
            acronym: true,
            name: true,
        },
        where: {
            acronym: {
                startsWith: 'LAMOD'
            }
        },
        distinct: ['acronym']
    });
    if (result) {
        // add hard coded module Ids which are not modelled in database
        result.concat([]);
        res.status(200).json(result);
    }
    else {
        next(new error_1.NotFoundError('Keine Module gefunden!'));
    }
}
async function getBilAppCourses(req, res, next) {
    const semester = validator_1.default.matches(req.params.semester, /(WS_\d{4}_\d{2})|(SoSe_\d{4})/g) ? req.params.semester : undefined;
    if (semester) {
        try {
            const courses = await prisma.bilAppCourse.findMany({
                select: {
                    id: true,
                    name: true,
                },
                where: {
                    semester: semester
                }
            });
            res.status(200).json(courses);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.BadRequestError('Die übergebenen Daten sind nicht valide.'));
    }
}
async function getCompetenceAndModulesOfCourse(req, res, next) {
    const id = validator_1.default.isInt(req.params.id, { min: 2, max: 500 }) ? Number(req.params.id) : undefined;
    if (id) {
        try {
            const course = await prisma.bilAppCourse.findFirst({
                include: {
                    modules: {
                        select: {
                            modId: true
                        }
                    },
                    comp: {
                        select: {
                            compId: true,
                            fulfillment: true
                        }
                    }
                },
                where: {
                    id: id
                }
            });
            res.status(200).json(course);
        }
        catch (error) {
            (0, error_1.logError)(error);
            next(new error_1.BadRequestError());
        }
    }
    else {
        next(new error_1.BadRequestError('Die übergebenen Daten sind nicht valide.'));
    }
}
