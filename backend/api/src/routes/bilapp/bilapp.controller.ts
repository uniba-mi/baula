import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BadRequestError, logError, NotFoundError } from "../../shared/error";
import validator from "validator";
import { checkSemester, transformCourses } from "../../shared/helpers/univis-helpers";
import { findActiveStudyPlan } from "../../shared/helpers/plan-helper";
import { UserServer } from "../../../../../interfaces/user";

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
      next(new BadRequestError("An unexpected error occurred.")); // TODO documentation
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

// get all saved courses form semester plans and returns ExpandedCourse
export async function getAllSavedCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  // find active study plan
  const studyPlan = await findActiveStudyPlan(user._id);
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
          const course = dbCourses.find(
            (el) => el.id == c.id && el.semester == semesterPlan.semester
          );
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
  } else {
    next(new NotFoundError("Keinen passenden Studienplan gefunden."));
  }
}

export async function getAllStandards(req: Request, res: Response) {
    const result = await prisma.standard.findMany();
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Standards gefunden!')
    }
}

export async function getSingleStandard(req: Request, res: Response) {
    const id = req.params.id;

    const result = await prisma.standard.findUnique({
        where: {
            stId: id
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Standards gefunden!')
    }
}

export async function getAllCompetences(req: Request, res: Response) {
    const result = await prisma.competence.findMany();
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!')
    }
}

export async function getCompetencesFromStandard(req: Request, res: Response) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            stId
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Zum angegebenen Standard wurden keine Kompetenzen gefunden!')
    }
}

export async function getUppestCompetenceGroups(req: Request, res: Response) {
    const stId = req.params.id;
    const result = await prisma.competence.findMany({
        where: {
            AND: {
                stId,
                parentId: null
            }
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Zum angegebenen Standard wurden keine Kompetenzgruppen gefunden!')
    }
}

export async function getAllUppestCompetenceGroups(req: Request, res: Response) {
    const result = await prisma.competence.findMany({
        where: {
            parentId: null
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Kompetenzgruppen gefunden!')
    }
}

export async function getAllLowerCompetences(req: Request, res: Response) {
    const result = await prisma.competence.findMany({
        where: {
            NOT: {
                parentId: null
            }
        }
    });
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!')
    }
}

export async function getLowerCompetences(req: Request, res: Response) {
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
    if(result) {
        res.status(200).json(result);
    } else {
        res.status(400).send('Es wurden keine Kompetenzen gefunden!')
    }
}