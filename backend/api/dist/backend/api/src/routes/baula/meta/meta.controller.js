"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistinctDepartments = getDistinctDepartments;
exports.getDistinctCourseTypes = getDistinctCourseTypes;
exports.getAcademicDatesBySemester = getAcademicDatesBySemester;
exports.getDateTypes = getDateTypes;
const client_1 = require("@prisma/client");
const error_1 = require("../../../shared/error");
const custom_validator_1 = require("../../../shared/helpers/custom-validator");
const prisma = new client_1.PrismaClient();
// get distinct departements of Courses
async function getDistinctDepartments(req, res, next) {
    try {
        const departments = await prisma.course.findMany({
            select: {
                orgname: true
            },
            distinct: ['orgname'],
            where: {
                orgname: {
                    not: {
                        equals: ''
                    }
                }
            }
        });
        if (departments) {
            // preprocess result currenty has form [{orgname: string}]
            const depAsStringArray = departments.map(el => el.orgname);
            res.status(200).json(depAsStringArray);
        }
        else {
            next(new error_1.NotFoundError("Keine Einrichtungen gefunden."));
        }
    }
    catch (error) {
        (0, error_1.logError)(error);
        next(new error_1.BadRequestError());
    }
}
// get distinct departements of Courses
async function getDistinctCourseTypes(req, res, next) {
    try {
        const types = await prisma.course.findMany({
            select: {
                type: true
            },
            distinct: ['type'],
            where: {
                type: {
                    not: {
                        equals: ''
                    }
                }
            }
        });
        if (types) {
            // preprocess result currenty has form [{type: string}]
            const typesAsStringArray = types.map(el => el.type);
            res.status(200).json(typesAsStringArray);
        }
        else {
            next(new error_1.NotFoundError("Keine Kurstypen gefunden."));
        }
    }
    catch (error) {
        (0, error_1.logError)(error);
        next(new error_1.BadRequestError());
    }
}
// get all academic dates of a semester
async function getAcademicDatesBySemester(req, res, next) {
    const semesterParam = req.params.semester;
    if (!semesterParam) {
        return next(new error_1.BadRequestError("Es wurde kein Semester angegeben."));
    }
    const semester = (0, custom_validator_1.validateAndReturnSemester)(semesterParam);
    if (semester) {
        try {
            const academicDates = await prisma.academicDate.findMany({
                where: {
                    semester: semester,
                },
                include: {
                    dateType: true,
                },
            });
            res.status(200).json(academicDates);
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
async function getDateTypes(req, res, next) {
    try {
        const types = await prisma.dateType.findMany();
        res.status(200).json(types);
    }
    catch (error) {
        next(new error_1.BadRequestError(`Beim Aufrufen der Daten ist ein Fehler aufgetreten.`));
    }
}
