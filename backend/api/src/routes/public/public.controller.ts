import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BadRequestError, logError, NotFoundError } from "../../shared/error";
import validator from "validator";
const prisma = new PrismaClient();

export async function getUniqueModules(req: Request, res: Response, next: NextFunction) {
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
    if(result) {
        // add hard coded module Ids which are not modelled in database
        result.concat([

        ])
        res.status(200).json(result);
    } else {
        next(new NotFoundError('Keine Module gefunden!'))
    }
}

export async function getBilAppCourses(req: Request, res: Response, next: NextFunction) {
    const semester = validator.matches(req.params.semester, /(WS_\d{4}_\d{2})|(SoSe_\d{4})/g) ? req.params.semester : undefined;
    if(semester) {
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
        } catch (error) {
            logError(error)
            next(new BadRequestError());
        }
    } else {
        next(new BadRequestError('Die übergebenen Daten sind nicht valide.'))
    }
}

export async function getCompetenceAndModulesOfCourse(req: Request, res: Response, next: NextFunction) {
    const id = validator.isInt(req.params.id, { min: 2, max: 500 }) ? Number(req.params.id) : undefined;
    if(id) {
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
        } catch (error) {
            logError(error)
            next(new BadRequestError());
        }
    } else {
        next(new BadRequestError('Die übergebenen Daten sind nicht valide.'))
    }
}