"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueModules = getUniqueModules;
exports.getBilAppCourses = getBilAppCourses;
exports.getCompetenceAndModulesOfCourse = getCompetenceAndModulesOfCourse;
exports.getSpecificCourses = getSpecificCourses;
exports.getTopNCoursesForCompetence = getTopNCoursesForCompetence;
exports.getAllSavedCourses = getAllSavedCourses;
exports.getAllStandards = getAllStandards;
exports.getSingleStandard = getSingleStandard;
exports.getAllCompetences = getAllCompetences;
exports.getCompetencesFromStandard = getCompetencesFromStandard;
exports.getUppestCompetenceGroups = getUppestCompetenceGroups;
exports.getAllUppestCompetenceGroups = getAllUppestCompetenceGroups;
exports.getAllLowerCompetences = getAllLowerCompetences;
exports.getLowerCompetences = getLowerCompetences;
const client_1 = require("@prisma/client");
const error_1 = require("../../shared/error");
const validator_1 = __importDefault(require("validator"));
const univis_helpers_1 = require("../../shared/helpers/univis-helpers");
const plan_helper_1 = require("../../shared/helpers/plan-helper");
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
async function getSpecificCourses(req, res, next) {
    const searchTerm = validator_1.default.isAlphanumeric(req.params.searchTerm, undefined, { ignore: " .-_" })
        ? req.params.searchTerm
        : undefined;
    const semester = (0, univis_helpers_1.checkSemester)(req.params.semester);
    if (searchTerm && semester) {
        try {
            const courses = await prisma.course.findMany({
                orderBy: {
                    name: "asc",
                },
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
                    AND: [
                        {
                            semester: {
                                equals: semester,
                            },
                        },
                        {
                            OR: [
                                {
                                    organizational: {
                                        contains: searchTerm,
                                    },
                                },
                                {
                                    mCourses: {
                                        some: {
                                            mcId: {
                                                startsWith: searchTerm,
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            });
            if (courses && courses.length !== 0) {
                res.status(200).json((0, univis_helpers_1.transformCourses)(courses));
            }
            else {
                next(new error_1.NotFoundError());
            }
        }
        catch (error) {
            next(new error_1.BadRequestError("An unexpected error occurred.")); // TODO documentation
        }
    }
    else {
        next(new error_1.BadRequestError());
    }
}
async function getTopNCoursesForCompetence(req, res, next) {
    const competence = validator_1.default.isAlphanumeric(req.params.competence, undefined, { ignore: "_" })
        ? req.params.competence
        : undefined;
    const semester = (0, univis_helpers_1.checkSemester)(req.params.semester);
    const topN = validator_1.default.isInt(req.params.topN) ? parseInt(req.params.topN) : undefined;
    if (competence && semester && topN) {
        try {
            const result = await prisma.competenceCourse.groupBy({
                by: ["cId", "semester"],
                _sum: {
                    fulfillment: true,
                },
                where: {
                    AND: {
                        semester: {
                            equals: semester,
                        },
                        comp: {
                            parentId: {
                                equals: competence,
                            },
                        },
                    },
                },
                orderBy: {
                    _sum: {
                        fulfillment: "desc",
                    },
                },
                take: topN,
            });
            let courses = [];
            if (result.length !== 0) {
                for (let lect of result) {
                    let result = await prisma.course.findUnique({
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
                            id_semester: {
                                id: lect.cId,
                                semester: lect.semester,
                            },
                        },
                    });
                    if (result) {
                        courses.push(result);
                    }
                }
            }
            res.status(200).json(courses);
        }
        catch (error) {
            next(new error_1.BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
        }
    }
    else {
        next(new error_1.BadRequestError("Die übergebenen Werte sind nicht valide."));
    }
}
// get all saved courses form semester plans and returns ExpandedCourse
async function getAllSavedCourses(req, res, next) {
    const user = req.user;
    // find active study plan
    const studyPlan = await (0, plan_helper_1.findActiveStudyPlan)(user._id);
    if (studyPlan) {
        let courses = [];
        const semesterPlans = studyPlan.semesterPlans;
        // extract courses
        for (let semesterPlan of semesterPlans) {
            if (semesterPlan.courses.length !== 0) {
                const keys = semesterPlan.courses.map((el) => el.id);
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
                            semester: semesterPlan.semester,
                            id: {
                                in: keys,
                            },
                        },
                    },
                });
                // map MongoDB with Prisma Entries
                for (let c of semesterPlan.courses) {
                    const course = dbCourses.find((el) => el.id == c.id && el.semester == semesterPlan.semester);
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
async function getAllStandards(req, res) {
    const result = await prisma.standard.findMany();
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Standards gefunden!');
    }
}
async function getSingleStandard(req, res) {
    const id = req.params.id;
    const result = await prisma.standard.findUnique({
        where: {
            stId: id
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Standards gefunden!');
    }
}
async function getAllCompetences(req, res) {
    const result = await prisma.competence.findMany();
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!');
    }
}
async function getCompetencesFromStandard(req, res) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            stId
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Zum angegebenen Standard wurden keine Kompetenzen gefunden!');
    }
}
async function getUppestCompetenceGroups(req, res) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            AND: {
                stId,
                parentId: null
            }
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Zum angegebenen Standard wurden keine Kompetenzgruppen gefunden!');
    }
}
async function getAllUppestCompetenceGroups(req, res) {
    const result = await prisma.competence.findMany({
        where: {
            parentId: null
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Kompetenzgruppen gefunden!');
    }
}
async function getAllLowerCompetences(req, res) {
    const result = await prisma.competence.findMany({
        where: {
            NOT: {
                parentId: null
            }
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!');
    }
}
async function getLowerCompetences(req, res) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            AND: {
                stId,
                NOT: {
                    parentId: null
                }
            }
        }
    });
    if (result) {
        res.status(200).json(result);
    }
    else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!');
    }
}
