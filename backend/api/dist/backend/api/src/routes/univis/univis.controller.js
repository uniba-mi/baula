"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseDetails = getCourseDetails;
exports.getSpecificCourses = getSpecificCourses;
exports.getTopNCoursesForCompetence = getTopNCoursesForCompetence;
exports.getCoursesOfSemester = getCoursesOfSemester;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const validator_1 = __importDefault(require("validator"));
const error_1 = require("../../shared/error");
const univisHelpers_1 = require("../../shared/univisHelpers");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
//false: only support simple bodys, true would support rich data
router.use(express_1.default.urlencoded({ extended: false }));
//json data will be extracted
router.use(express_1.default.json());
async function getCourseDetails(req, res, next) {
    const id = validator_1.default.isAlphanumeric(String(req.params.id), undefined, {
        ignore: "_.",
    })
        ? req.params.id
        : undefined;
    const semester = (0, univisHelpers_1.checkSemester)(req.params.semester);
    if (id && semester) {
        const course = await prisma.course.findUnique({
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
                    id,
                    semester,
                },
            },
        });
        if (course) {
            const resultCourse = {
                ...course,
                dozs: (0, univisHelpers_1.transformDozs)(course.dozs),
            };
            res.status(200).json(resultCourse);
        }
        else {
            next(new error_1.NotFoundError("Keine Veranstaltung gefunden!"));
        }
    }
    else {
        next(new error_1.BadRequestError("Es wurden invalide Daten übergeben."));
    }
}
async function getSpecificCourses(req, res, next) {
    const searchTerm = validator_1.default.isAlphanumeric(req.params.searchTerm, undefined, { ignore: " .-_" })
        ? req.params.searchTerm
        : undefined;
    const semester = (0, univisHelpers_1.checkSemester)(req.params.semester);
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
                res.status(200).json((0, univisHelpers_1.transformCourses)(courses));
            }
            else {
                next(new error_1.NotFoundError());
            }
        }
        catch (error) {
            next(new error_1.BadRequestError("Es ist ein unerwarteter Fehler aufgetreten!"));
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
    const semester = (0, univisHelpers_1.checkSemester)(req.params.semester);
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
async function getCoursesOfSemester(req, res, next) {
    const semester = (0, univisHelpers_1.checkSemester)(req.params.semester);
    if (semester) {
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
                semester: {
                    equals: semester,
                },
            }
        });
        if (courses) {
            res.status(200).json((0, univisHelpers_1.transformCourses)(courses));
        }
        else {
            next(new error_1.NotFoundError("Es konnten keine Lehrveranstaltungen gefunden werden."));
        }
    }
    else {
        next(new error_1.BadRequestError("Das angegebene Semester enthält einen Fehler"));
    }
}
