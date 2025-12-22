import { Prisma, PrismaClient } from "@prisma/client";
import { transform } from "camaro";
import { IncomingMessage } from "http";
import https from "https";
import { courses, rooms, persons } from "../../templates/univis-template";
import { CompetenceFulfillment } from "../../../../../interfaces/competence";
import { Course, Term, UnivISCourse } from "../../../../../interfaces/course";
import { BadRequestError } from "../error";
import {
  addCompetences,
  addConnectionToPersons,
  addCourse,
  addModuleConnection,
  addPersons,
  addRooms,
  extractCompetenceInformation,
  findCourseParent,
  transformEntry,
  transformUnivISCourse,
} from "./univis-helpers";
import { Person } from "../../../../../interfaces/person";

const prisma = new PrismaClient();

export async function crawlUnivis(url: string): Promise<string> {
  let result = new Promise<string>((resolve, reject) => {
    https
      .get(url, async (response: IncomingMessage) => {
        response.setEncoding("utf8");
        let result = await new Promise<string>((resolve) => {
          let body = "";
          response.on("data", (chunk: string) => {
            body += chunk;
          });
          response.on("end", () => {
            resolve(body);
          });
        });
        resolve(result);
      })
      .on("error", (error: Error) => reject(error));
  });
  return result;
}

export async function processUnivisData(
  semester: string
): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    let startTime = Date.now();
    if(!process.env.UNIVIS_API_URL) {
      reject('Es wurde kein gültiger API-Endpunkt für UnivIS angegeben.')
    }
    const queryLink = `${process.env.UNIVIS_API_URL}${semester}`;
    const data = await crawlUnivis(queryLink);
    let message: string[] = [];

    try {
      // take crawled xml and transform input to courses, rooms and persons, templates given in parent-folder 'templates/univis_template.ts'
      const newCourses: UnivISCourse[] = await transform(data, courses);
      const resultRooms = await transform(data, rooms);
      const resultPersons = await transform(data, persons);

      // add rooms to database
      const addedRooms = await addRooms(resultRooms);
      message.push(`${addedRooms.count} Rooms updated`);

      // add persons to database
      const addedPersons = await addPersons(resultPersons);
      message.push(`${addedPersons.count} Persons updated`);

      // No error occured and resultCourses is array
      if (addedPersons && addedRooms && Array.isArray(newCourses)) {
        let addedEntries = 0;
        let updatedEntries = 0;
        let updateLog: string[] = [];
        let errorsOccured = 0;
        let addedConnections = 0;
        let addedCompetences = 0;
        let addedModuleConnections = 0;
        let errorLog = [];
        let parentCourses: UnivISCourse[] = [];

        // get all courses of the given semester and put into map
        const oldCourses = await prisma.course.findMany({
          where: {
            semester: semester,
          },
          include: {
            dozs: {
              select: {
                pId: true,
              },
            },
            terms: {
              select: {
                startdate: true,
                enddate: true,
                starttime: true,
                endtime: true,
                repeat: true,
                exclude: true,
                roomId: true,
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
          },
        });
        const oldCoursesMap = new Map<string, any>();
        oldCourses.forEach((course) => oldCoursesMap.set(course.id, course));

        // itterate over courses
        for (let unvisCourse of newCourses) {
          // before everthing transform organization since it is separated by multiple <br>
          let organizational = unvisCourse.organizational.split('<split>').filter(el => el !== '')
          unvisCourse.organizational = organizational.join('<br>')
          // if course is a copy, skip course
          if (!unvisCourse.participationCopy && !unvisCourse.importCopy) {
            let course = transformUnivISCourse(unvisCourse, semester);
            course.competence = await extractCompetenceInformation(course);

            // check if course has children courses
            if (unvisCourse.children && unvisCourse.children.length !== 0) {
              parentCourses.push(unvisCourse);
            } else {
              // check falsy values
              if (course.id !== "") {
                // check if course has parent
                try {
                  const parent = findCourseParent(course, parentCourses);
                  if (parent) {
                    // transform entry
                    course = transformEntry(course, parent);
                  }
                  const oldCourse = oldCoursesMap.get(unvisCourse.id);

                  // Case 1: no old course exists -> create course new:
                  if (!oldCourse) {
                    const addEntry = await addCourse(course);
                    updateLog.push(`Added ${course.id} - ${course.name}`)
                    addedEntries++;
                  } else {
                    // delete course from oldCourseMap so old courses to delete remain
                    oldCoursesMap.delete(course.id);

                    // Case 2: old course exists -> check for updates
                    const valuesToUpdate: any = {};
                    let updateDozsNeeded = false;
                    let updateTermsNeeded = false;
                    let updateCompetencesNeeded = false;

                    for (const key in course) {
                      switch (key) {
                        case "lastUpdated":
                          break;
                        case "competence":
                          // case 1: some new competences were created or old were deleted
                          if (
                            course.competence.length !==
                            oldCourse.competence.length
                          ) {
                            updateCompetencesNeeded = true;
                            updateLog.push(`${course.id} - update of competence`)
                            break;
                          }
                          // case 2: something changed within a competence
                          if (course.competence.length !== 0) {
                            let j = 0;
                            for (const comp of course.competence) {
                              for (const compKey in comp) {
                                if (
                                  comp[
                                    compKey as keyof CompetenceFulfillment
                                  ] !==
                                  oldCourse.competence[j][
                                    compKey as keyof CompetenceFulfillment
                                  ]
                                ) {
                                  // something in competence changed!
                                  updateCompetencesNeeded = true;
                                  updateLog.push(`${course.id} - update of competence`)
                                  break;
                                }
                              }
                              if (updateCompetencesNeeded) {
                                break;
                              }
                              j++;
                            }
                          }
                          break;
                        case "terms":
                          let i = 0;
                          // case 1: a new term was created or an old one deleted
                          if (course.terms.length !== oldCourse.terms.length) {
                            updateTermsNeeded = true;
                            break;
                          }
                          // case 2: something changed within a term
                          for (const term of course.terms) {
                            for (const termKey in term) {
                              if (
                                term[termKey as keyof Term] !==
                                oldCourse.terms[i][termKey as keyof Term]
                              ) {
                                // something in term changed!
                                updateTermsNeeded = true;
                                updateLog.push(`${course.id} - update of terms`)
                                break;
                              }
                            }
                            if (updateTermsNeeded) {
                              break;
                            }
                            i++;
                          }
                          break;
                        case "dozs":
                          const newDozs = course.dozs.map(
                            (person) => person.pId
                          );
                          const oldDozs = oldCourse.dozs.map(
                            (person: Person) => person.pId
                          );
                          const union = Array.from(
                            new Set([...newDozs.concat(oldDozs)])
                          );
                          if (union.length !== newDozs.length) {
                            updateDozsNeeded = true;
                            updateLog.push(`${course.id} - update of teachers`)
                          }
                          break;
                        default:
                          if (
                            course[key as keyof Course] !==
                            oldCourse[key as keyof Course]
                          ) {
                            updateLog.push(`${course.id} - update in ${key}`)
                            // key that has changed information
                            valuesToUpdate[key as keyof Course] =
                              course[key as keyof Course];
                          }
                          break;
                      }
                    }
                    if (
                      Object.keys(valuesToUpdate).length > 0 ||
                      updateDozsNeeded ||
                      updateTermsNeeded
                    ) {
                      const updateEntry = await prisma.course.update({
                        where: {
                          id_semester: {
                            id: course.id,
                            semester: semester,
                          },
                        },
                        data: {
                          ...valuesToUpdate,
                          dozs: updateDozsNeeded
                            ? {
                                deleteMany: {},
                                create: course.dozs,
                              }
                            : undefined,
                          terms: updateTermsNeeded
                            ? {
                                deleteMany: {},
                                create: course.terms,
                              }
                            : undefined,
                          competence: updateCompetencesNeeded
                            ? {
                                deleteMany: {},
                                create: course.competence.map((comp) => {
                                  return {
                                    compId: comp.compId,
                                    fulfillment: comp.fulfillment,
                                  };
                                }),
                              }
                            : undefined,
                          mCourses: undefined,
                        },
                      });
                      updatedEntries++;
                    }
                  }

                  const addConnections = await addConnectionToPersons(course);
                  if (addConnections) {
                    addedConnections += addConnections.count;
                  }
                  const addCompetenceConnections = await addCompetences(course);
                  if (addCompetenceConnections) {
                    addedCompetences += addCompetenceConnections.count;
                  }
                  const addModuleConnections = await addModuleConnection(
                    course
                  );
                  if (addModuleConnections) {
                    addedModuleConnections += addModuleConnections.count;
                  }
                } catch (error) {
                  console.log(error);
                  errorsOccured++;
                  errorLog.push(error);
                }
              } else {
                reject(
                  new BadRequestError(
                    "Es ist ein Fehler in Ihrer Anfrage vorgekommen."
                  )
                );
              }
            }
          }
        }

        // Case 3: All courses left in the map have to be deleted
        const courses2delete = [...oldCoursesMap.keys()];
        const deletedCourses = await prisma.course.deleteMany({
          where: {
            AND: [
              {
                id: {
                  in: courses2delete,
                },
              },
              {
                semester: semester,
              },
            ],
          },
        });
        for(const oldCourseId of courses2delete) {
          const oldCourse = oldCourses.find(el => el.id == oldCourseId)
          if(oldCourse) {
            updateLog.push(`Removed ${oldCourse.id} - ${oldCourse.name}`)
          }
        }
        message.push(`${addedEntries} Courses added`);
        message.push(`${updatedEntries} Courses updated`);
        message.push(`${deletedCourses.count} Courses deleted`);
        message.push(`${addedConnections} Connections to Persons added`);
        message.push(`${addedCompetences} Connections to Competences added`);
        message.push(`${addedModuleConnections} Connections to Modules added`);
        message.push(`${errorsOccured} Errors occured`);
        message = message.concat(updateLog);
        let difference = ((Date.now() - startTime) / 1000) | 0;
        let minutes = (difference / 60) | 0;
        let seconds = difference - minutes * 60;
        message.push(`${minutes} Minutes and ${seconds} Seconds to process`);
        //message.push(errorLog.join(";"));
        resolve(message);
      } else {
        reject(
          new BadRequestError("Es ist ein Fehler in Ihrer Anfrage vorgekommen.")
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}
