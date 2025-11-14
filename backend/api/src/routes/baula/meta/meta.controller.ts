import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { BadRequestError, logError, NotFoundError } from '../../../shared/error';
import { validateAndReturnSemester } from '../../../shared/helpers/custom-validator';

const prisma = new PrismaClient();

// get distinct departements of Courses
export async function getDistinctDepartments(req: Request, res: Response, next: NextFunction) {
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
            const depAsStringArray = departments.map(el => el.orgname)
            res.status(200).json(depAsStringArray);
        } else {
            next(new NotFoundError("Keine Einrichtungen gefunden."))
        }
    } catch (error) {
        logError(error)
        next(new BadRequestError())
    }
}

// get distinct departements of Courses
export async function getDistinctCourseTypes(req: Request, res: Response, next: NextFunction) {
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
            const typesAsStringArray = types.map(el => el.type)
            res.status(200).json(typesAsStringArray);
        } else {
            next(new NotFoundError("Keine Kurstypen gefunden."))
        }
    } catch (error) {
        logError(error)
        next(new BadRequestError())
    }
}

// get all academic dates of a semester
export async function getAcademicDatesBySemester(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const semesterParam = req.params.semester;
    if (!semesterParam) {
        return next(new BadRequestError("Es wurde kein Semester angegeben."));
    }
    const semester = validateAndReturnSemester(semesterParam);

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
        } catch (error) {
            logError(error);
            next(
                new BadRequestError(
                    "Beim Abrufen der Daten ist ein Fehler aufgetreten."
                )
            );
        }
    } else {
        next(new BadRequestError("Das angegebene Semester ist nicht valide."));
    }
}

export async function getDateTypes(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const types = await prisma.dateType.findMany();
        res.status(200).json(types);
    } catch (error: any) {
        next(
            new BadRequestError(`Beim Aufrufen der Daten ist ein Fehler aufgetreten.`)
        );
    }
}