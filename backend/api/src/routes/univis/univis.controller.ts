import express, { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import validator from "validator";
import { BadRequestError, NotFoundError } from "../../shared/error";
import {
  checkSemester,
  transformCourses,
  transformDozs,
} from "../../shared/univisHelpers";

const router: Router = express.Router();
const prisma = new PrismaClient();
//false: only support simple bodys, true would support rich data
router.use(express.urlencoded({ extended: false }));
//json data will be extracted
router.use(express.json());

export async function getCourseDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = validator.isAlphanumeric(String(req.params.id), undefined, {
    ignore: "_.",
  })
    ? req.params.id
    : undefined;
  const semester = checkSemester(req.params.semester);

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
        dozs: transformDozs(course.dozs),
      };
      res.status(200).json(resultCourse);
    } else {
      next(new NotFoundError("Keine Veranstaltung gefunden!"));
    }
  } else {
    next(new BadRequestError("Es wurden invalide Daten übergeben."));
  }
}



export async function getSpecificCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const searchTerm = validator.isAlphanumeric(
    req.params.searchTerm,
    undefined,
    { ignore: " .-_" }
  )
    ? req.params.searchTerm
    : undefined;
  const semester = checkSemester(req.params.semester);
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
        res.status(200).json(transformCourses(courses));
      } else {
        next(new NotFoundError());
      }
    } catch (error) {
      next(new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten!"));
    }
  } else {
    next(new BadRequestError());
  }
}

export async function getTopNCoursesForCompetence(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const competence = validator.isAlphanumeric(
    req.params.competence,
    undefined,
    { ignore: "_" }
  )
    ? req.params.competence
    : undefined;
  const semester = checkSemester(req.params.semester);
  const topN = validator.isInt(req.params.topN) ? parseInt(req.params.topN) : undefined;

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
    } catch (error) {
      next(new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
    }
  } else {
    next(new BadRequestError("Die übergebenen Werte sind nicht valide."));
  }
}

export async function getCoursesOfSemester(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = checkSemester(req.params.semester);
  if(semester) {
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
      res.status(200).json(transformCourses(courses));
    } else {
      next(new NotFoundError("Es konnten keine Lehrveranstaltungen gefunden werden."));
    }
  } else {
    next(new BadRequestError("Das angegebene Semester enthält einen Fehler"))
  }
}