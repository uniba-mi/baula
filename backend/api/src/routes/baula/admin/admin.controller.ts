import { NextFunction, Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { BadRequestError, logError, NotFoundError } from "../../../shared/error";
import validator from "validator";
import { validateAndReturnSemester } from "../../../shared/helpers/custom-validator";
import path from "path";
import * as fs from "fs";
import { checkSemester } from "../../../shared/helpers/univis-helpers";
import { processUnivisData } from "../../../shared/helpers/univis-crawler";
import { transform } from "camaro";
import {
  mhbTemplate,
  mgTemplate,
  modTemplate,
  mcTemplate,
  mg2mgTemplate,
  mhb2mgTemplate,
  mg2modTemplate,
  spTemplate,
  m2mcTemplate,
  depTemplate,
  personTemplate,
  per2mcTemplate,
  moduleExamTemplate,
  modDepTemplate,
  sp2mhbTemplate,
} from "../../../templates/mhb-fn2mod";
import {
  Embedding,
  ModEmbedding,
  StudyPlan,
  TopicM,
  User,
} from "../../../database/mongo";
import https from "https";
import {
  upsertDeparmtents,
  upsertModuleCourses,
  upsertModuleExams,
  upsertModuleGroups,
  upsertModuleHandbooks,
  upsertModules,
  upsertPersons,
  upsertStudyprogrammes,
} from "../../../shared/helpers/fn2mod-helper";

const prisma = new PrismaClient();

// request to get the logs of the cronjob
export async function getCronjobLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // read and deliver json file
    const filePath = path.join(__dirname, "../../../logs", "cronjob.log");
    const logData = await fs.promises.readFile(filePath, "utf-8");

    // Convert log data into JSON format (array of log entries)
    const logEntries = logData
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .splice(-500);
    res.json(logEntries);
  } catch (err) {
    logError(err);
    next(new BadRequestError("Fehler beim Lesen der Logdatei"));
  }
}

export async function getErrorLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // read and deliver json file
    const filePath = path.join(__dirname, "../../../logs", "error.log");
    const logData = await fs.promises.readFile(filePath, "utf-8");

    // Convert log data into JSON format (array of log entries)
    const logEntries = logData
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .splice(-500);
    res.json(logEntries);
  } catch (err) {
    logError(err);
    next(new BadRequestError("Fehler beim Lesen der Logdatei"));
  }
}

// requests for academic dates
export async function getAllAcademicDates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const academicDates = await prisma.academicDate.findMany({
      include: {
        dateType: true,
      },
    });
    res.status(200).json(academicDates);
  } catch (error) {
    logError(error);
    next(new BadRequestError());
  }
}

export async function addAcademicDate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const desc = validator.isAlphanumeric(req.body.desc, "de-DE", {
    ignore: " .!?äöüß,",
  })
    ? req.body.desc
    : "";
  const startdate = validator.isDate(req.body.startdate)
    ? req.body.startdate
    : undefined;
  const enddate = validator.isDate(req.body.enddate)
    ? req.body.enddate
    : undefined;
  const starttime = validator.isTime(req.body.starttime)
    ? req.body.starttime
    : undefined;
  const endtime = validator.isTime(req.body.endtime)
    ? req.body.endtime
    : undefined;
  const datetypeId = validator.isNumeric(String(req.body.datetypeId))
    ? req.body.datetypeId
    : undefined;
  const semester = validateAndReturnSemester(req.body.semester);

  if (startdate && enddate && datetypeId && semester) {
    try {
      const result = await prisma.academicDate.create({
        data: {
          startdate: new Date(startdate),
          enddate: new Date(enddate),
          starttime,
          endtime,
          semester,
          desc,
          typeId: datetypeId,
        },
        include: {
          dateType: true,
        },
      });
      res.status(200).json(result);
    } catch (error) {
      logError(error);
      next(new BadRequestError());
    }
  } else {
    next(new BadRequestError());
  }
}

export async function updateAcademicDate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = validator.isNumeric(String(req.body.id)) ? req.body.id : undefined;
  const desc = validator.isAlphanumeric(req.body.desc, "de-DE", {
    ignore: " .!?äöüß,",
  })
    ? req.body.desc
    : "";
  const startdate = validator.isDate(req.body.startdate)
    ? req.body.startdate
    : undefined;
  const enddate = validator.isDate(req.body.enddate)
    ? req.body.enddate
    : undefined;
  const starttime = validator.isTime(req.body.starttime)
    ? req.body.starttime
    : undefined;
  const endtime = validator.isTime(req.body.endtime)
    ? req.body.endtime
    : undefined;
  const datetypeId = validator.isNumeric(String(req.body.datetypeId))
    ? req.body.datetypeId
    : undefined;
  const semester = validateAndReturnSemester(req.body.semester);

  if (id && startdate && enddate && datetypeId && semester) {
    try {
      const result = await prisma.academicDate.update({
        where: {
          id,
        },
        data: {
          startdate: new Date(startdate),
          enddate: new Date(enddate),
          starttime,
          endtime,
          semester,
          desc,
          typeId: datetypeId,
        },
        include: {
          dateType: true,
        },
      });
      res.status(200).json(result);
    } catch (error) {
      logError(error);
      next(new BadRequestError());
    }
  } else {
    next(new BadRequestError());
  }
}

export async function deleteAcademicDate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = validator.isNumeric(req.params.id)
    ? Number(req.params.id)
    : undefined;

  if (id) {
    try {
      const result = await prisma.academicDate.delete({
        where: {
          id,
        },
      });
      res.status(200).json(result);
    } catch (error) {
      logError(error);
      next(new BadRequestError("Fehler beim Löschen des Datums"));
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

export async function addDateType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const name = validator.isAlphanumeric(req.body.name, "de-DE", {
    ignore: " .!?äöüß,",
  })
    ? req.body.name
    : undefined;
  const desc = validator.isAlphanumeric(req.body.desc, "de-DE", {
    ignore: " .!?äöüß,",
  })
    ? req.body.desc
    : "";

  if (name) {
    try {
      const result = await prisma.dateType.create({
        data: {
          name,
          desc,
        },
      });
      res.status(200).json(result);
    } catch (error) {
      logError(error);
      next(new BadRequestError("Fehler beim Hinzufügen des Datentyps"));
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

export async function updateDateType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = validator.isNumeric(String(req.body.id))
    ? Number(req.body.id)
    : undefined;
  const name = validator.isAlphanumeric(req.body.name, "de-DE", {
    ignore: " .!?äöüß,",
  })
    ? req.body.name
    : undefined;
  const desc = validator.isAlphanumeric(req.body.desc, "de-DE", {
    ignore: " .!?äöüß,",
  })
    ? req.body.desc
    : "";

  if (name) {
    try {
      const result = await prisma.dateType.update({
        where: {
          typeId: id,
        },
        data: {
          name,
          desc,
        },
      });
      res.status(200).json(result);
    } catch (error) {
      logError(error);
      next(new BadRequestError("Fehler beim Aktualisieren des Datentyps"));
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

export async function deleteDateType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = validator.isNumeric(String(req.params.id))
    ? Number(req.params.id)
    : undefined;

  if (id) {
    try {
      const result = await prisma.dateType.delete({
        where: {
          typeId: id,
        },
      });
      res.status(200).json(result);
    } catch (error) {
      logError(error);
      next(new BadRequestError("Fehler beim Löschen des Datentyps"));
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

export async function getConnectedCoursesForModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const moduleId = validator.isAlphanumeric(req.params.id, undefined, {
    ignore: "_-",
  })
    ? req.params.id
    : undefined;
  const version = validator.isInt(req.params.version)
    ? Number(req.params.version)
    : undefined;
  const semester = validateAndReturnSemester(req.params.semester);

  if (moduleId && version && semester) {
    try {
      const moduleCourses = await prisma.mod2ModCourse.findMany({
        include: {
          mCourse: true,
        },
        where: {
          AND: [
            {
              mId: moduleId,
            },
            {
              mVersion: version,
            },
          ],
        },
      });
      if (moduleCourses) {
        let courses: any[] = [];
        for (let mCourse of moduleCourses) {
          const connectedCourses = await prisma.course2ModuleCourse.findMany({
            include: {
              course: true,
              modCourse: true,
            },
            where: {
              AND: [
                {
                  mcId: mCourse.mcId,
                },
                {
                  semester: semester,
                },
              ],
            },
          });
          if (connectedCourses) {
            courses = courses.concat([...connectedCourses]);
          }
        }
        res.json(courses);
      } else {
        next(
          new NotFoundError(
            "Es konnte zu dem Modul keine Modulkurse gefunden werden!"
          )
        );
      }
    } catch (error) {
      logError(error);
      next(new BadRequestError("Fehler beim Abrufen der Modulkurse"));
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

export async function initConnectionModulecourse2Course(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let messages = [];
  let startTime = Date.now();
  try {
    const moduleCourses = await prisma.moduleCourse.findMany({
      include: {
        modules: {
          select: {
            acronym: true,
          },
        },
      },
    });
    const template: Prisma.Course2ModuleCourseCreateManyInput[] = [];

    if (moduleCourses) {
      for (let mc of moduleCourses) {
        let name;
        let acronym;
        if (typeof mc.identifier === "object" && mc.identifier) {
          for (let [key, value] of Object.entries(mc.identifier)) {
            if (key == "name") {
              name = value ? value.toString() : "";
            }
            if (key == "acronym") {
              acronym = value ? value.toString() : mc.modules[0].acronym;
            }
          }
        } else {
          name = undefined;
          acronym = mc.modules[0].acronym;
        }

        if (acronym) {
          const courses = await prisma.course.findMany({
            where: {
              OR: [
                {
                  // checks if acronym is contained and type is same
                  AND: [
                    {
                      short: {
                        contains: acronym,
                      },
                    },
                    {
                      type: {
                        contains: mc.type,
                      },
                    },
                  ],
                },
                {
                  AND: [
                    {
                      name: {
                        contains: acronym,
                      },
                    },
                    {
                      type: {
                        contains: mc.type,
                      },
                    },
                  ],
                },
                {
                  // checks if organizatinal contains acronym, name of module is contained in course name and type is the same
                  AND: [
                    {
                      organizational: {
                        contains: acronym,
                      },
                    },
                    {
                      type: {
                        contains: mc.type,
                      },
                    },
                    {
                      name: {
                        contains: name,
                      },
                    },
                  ],
                },
              ],
            },
          });
          if (courses) {
            for (let course of courses) {
              template.push({
                mcId: mc.mcId,
                cId: course.id,
                semester: course.semester,
              });
            }
          }
        }
      }

      if (template.length == 0) {
        next(new NotFoundError("Keine Einträge zum Hinzufügen"));
      } else {
        const result = await prisma.course2ModuleCourse.createMany({
          data: template,
          skipDuplicates: true,
        });
        let difference = ((Date.now() - startTime) / 1000) | 0;
        let minutes = (difference / 60) | 0;
        let seconds = difference - minutes * 60;
        messages.push(`${minutes} Minutes and ${seconds} Seconds to process`);
        messages.push(`${result.count} Connections made`);
        res.status(200).send(messages);
      }
    } else {
      next(
        new NotFoundError("Es liegen noch keine Modullehrveranstaltungen vor!")
      );
    }
  } catch (error) {
    logError(error);
    next(new BadRequestError("Fehler beim Initialisieren der Verbindung"));
  }
}

export async function createCourseToModuleConnection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const mcId = validator.isAlphanumeric(req.body.mcId, "de-DE", { ignore: "-" })
    ? req.body.mcId
    : undefined;
  const cId = validator.isAlphanumeric(req.body.cId, "de-DE", { ignore: "_." })
    ? req.body.cId
    : undefined;
  const semester = validateAndReturnSemester(req.body.semester);

  if (mcId && cId && semester) {
    try {
      // create connection
      await prisma.course2ModuleCourse.create({
        data: {
          mcId,
          cId,
          semester,
        },
      });
      res.status(200).json("Die Modulverbindung wurde hergestellt!");
    } catch (error) {
      logError(error);
      next(new BadRequestError("Fehler beim Erstellen der Verbindung"));
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

export async function deleteCourseToModuleConnection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const mcId = validator.isAlphanumeric(req.params.mcId, "de-DE", {
    ignore: "-",
  })
    ? req.params.mcId
    : undefined;
  const cId = validator.isAlphanumeric(req.params.cId, "de-DE", {
    ignore: "_.",
  })
    ? req.params.cId
    : undefined;
  const semester = validateAndReturnSemester(req.params.semester);

  if (mcId && cId && semester) {
    try {
      // delete connection
      await prisma.course2ModuleCourse.delete({
        where: {
          mcId_cId_semester: {
            mcId,
            cId,
            semester,
          },
        },
      });

      res.status(200).json("Die Modulverbindung wurde erfolgreich gelöscht!");
    } catch (error) {
      logError(error);
      next(new BadRequestError("Fehler beim Löschen der Verbindung"));
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

export async function crawlCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // check if semester input is valid
  const semester = checkSemester(req.body.semester);

  if (semester) {
    processUnivisData(semester)
      .then((message) => {
        res.status(200).send(message);
      })
      .catch((error) => {
        logError(error);
        next(error);
      });
  } else {
    next(
      new BadRequestError("Das übergebene Semester hat das falsche Format.")
    );
  }
}

export async function crawlFN2Modules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const semester = checkSemester(req.params.semester);
  if (semester) {
    let startTime = Date.now();
    let mhbs: string = '';
    try {
      mhbs = await crawlFlexNow(semester);
    } catch (error) {
      logError(error);
      next(new BadRequestError("Fehler beim Crawlen der FlexNow-Daten"));
    }
    const result = await processFlexNowData(mhbs);
    let difference = ((Date.now() - startTime) / 1000) | 0;
    let minutes = (difference / 60) | 0;
    let seconds = difference - minutes * 60;
    result.push(`${minutes} Minutes and ${seconds} Seconds to process`);
    res.status(200).json(result);
  } else {
    next(
      new BadRequestError("Das übergebene Semester hat das falsche Format.")
    );
  }
}

// Add a xml file containing module structure into the database
export async function addModuleStructureToDatabase(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // typecheck body
  const xml: string =
    typeof req.body.xmltext == "string" ? req.body.xmltext : "";
  // check if xml starts and ends correct
  if (xml.startsWith("<Modulhandbuch") && xml.endsWith("</Modulhandbuch>")) {
    try {
      const result = await processFlexNowData(xml);
      if (result) {
        res.status(200).json(result);
      } else {
        next(new BadRequestError("Fehler beim Hinzufügen der Daten"));
      }
    } catch (error) {
      next(new BadRequestError("Fehler beim Hinzufügen der Daten"));
    }
  } else {
    next(new BadRequestError("Das XML hat das falsche Format."));
  }
}

/**
 * Update module embeddings with embedding vectors in JSON file
 */
export async function updateModuleEmbeddings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const embeddingsFilePath = path.join(
      __dirname,
      "../../../..",
      "staticdata",
      "module-embeddings.json"
    );
    const fileData = await fs.promises.readFile(embeddingsFilePath, "utf8");
    const embeddings = JSON.parse(fileData) as { [acronym: string]: number[] };
    const promises = Object.entries(embeddings).map(
      async ([acronym, vector]) => {
        return ModEmbedding.findOneAndUpdate(
          { acronym }, // match by acronym
          { acronym, vector },
          { upsert: true, new: true, setDefaultsOnInsert: true } // create new if does not exist
        );
      }
    );

    const results = await Promise.all(promises);

    res.status(200).json({
      message: "Modulembeddings wurden aktualisiert.",
      count: results.length,
      firstVectorLength: results[0]?.vector?.length || 0,
    });
  } catch (error) {
    next(
      new BadRequestError("Modulembeddings konnte nicht aktualisiert werden.")
    );
  }
}

/**
 * Initialize topics and embeddings from the JSON file containing topic vectors
 */
export async function initTopicsFromJSON(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const topicsFilePath = path.join(
      __dirname,
      "../../../..",
      "staticdata",
      "topic-embeddings.json"
    );

    // parse JSON file
    const fileData = await fs.promises.readFile(topicsFilePath, "utf8");
    const topicsData = JSON.parse(fileData) as Array<{
      topic: string;
      vector: number[];
      description: string;
      keywords: string[];
      parent: string;
    }>;

    // create parent topics
    const parentTopicNames = [
      ...new Set(topicsData.map((item) => item.parent)),
    ];
    const parentTopicsMap = new Map<string, string>();

    for (const parentName of parentTopicNames) {
      let parentTopic = await TopicM.findOne({ name: parentName });
      if (!parentTopic) {
        parentTopic = await TopicM.create({
          name: parentName,
        });
      }
      parentTopicsMap.set(parentName, parentTopic.tId);
    }

    const processedTopics = [];
    for (const topicData of topicsData) {
      const parentId = parentTopicsMap.get(topicData.parent);
      if (!parentId) {
        console.warn(`Parent not found for topic ${topicData.topic}`);
        continue;
      }

      // create/update the topic
      const topic = await TopicM.findOneAndUpdate(
        { name: topicData.topic },
        {
          name: topicData.topic,
          description:
            topicData.description || `Themenbeschreibung zu ${topicData.topic}`,
          keywords: topicData.keywords,
          parentId: parentId,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      let needsNewEmbedding = true;

      // update existing embedding if there is one
      if (topic.embeddingId) {
        const updatedEmbedding = await Embedding.findByIdAndUpdate(topic.embeddingId, {
          identifier: topic.tId,
          vector: topicData.vector,
        });

        if (updatedEmbedding) {
          needsNewEmbedding = false;
        } // also create new Embedding if none was found
      }

      if (needsNewEmbedding) {
        const embedding = await Embedding.create({
          identifier: topic.tId,
          vector: topicData.vector,
        });
        topic.embeddingId = embedding._id;
        await topic.save();
      }

      processedTopics.push({
        tId: topic.tId,
        name: topic.name,
        parentId: topic.parentId,
        embeddingId: topic.embeddingId,
      });
    }

    res.status(200).json({
      message: "Topics and embeddings initialized successfully",
      processed: processedTopics.length,
      parentTopics: parentTopicNames.length,
      vectorDimension: topicsData[0]?.vector.length,
    });
  } catch (error) {
    console.error("Error initializing topics:", error);
    next(new BadRequestError("Failed to initialize topics from JSON file"));
  }
}

export async function getReporting(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // define helper variables
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // request variables for report
    // count all users
    const allUsers = await User.countDocuments({
      authType: 'saml'
    });
    // count active users in the last month
    const activeUsers = await User.countDocuments({
      authType: 'saml',
      updatedAt: { $gte: oneMonthAgo },
    });
    // get cluster when users where last active
    const lastActiveUsersHistory = await User.aggregate([
      {
        $match: {
          authType: 'saml'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" }, // Extrahiere das Jahr aus dem updatedAt-Feld
            month: { $month: "$updatedAt" }, // Extrahiere den Monat aus dem updatedAt-Feld
          },
          count: { $sum: 1 }, // Zähle die Anzahl der Nutzer pro Monat und Jahr
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sortiere nach Jahr und Monat
      },
    ]);
    // count frequency of module status
    const frequencyModuleStatus = await User.aggregate([
      {
        $match: {
          authType: 'saml'
        }
      },
      { $unwind: "$completedModules" },
      { $group: { _id: "$completedModules.status", count: { $sum: 1 } } },
    ]);
    // count frequency of studyprogrammes
    const frequencyStudyProgrammes = await User.aggregate([
      {
        $match: {
          authType: 'saml'
        }
      },
      { $unwind: "$sps" },
      { $group: { _id: "$sps.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    // count frequency of study duration
    const frequencyDuration = await User.aggregate([
      {
        $match: {
          authType: 'saml'
        }
      },
      { $group: { _id: "$duration", count: { $sum: 1 } } },
    ]);
    // count frequency of startsemester
    const frequencyStartSemester = await User.aggregate([
      {
        $match: {
          authType: 'saml'
        }
      },
      { $group: { _id: "$startSemester", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    // count number of completed modules (clustered by 0, 1-5, 6-10 and 11+)
    const frequencyCompletedModules = await User.aggregate([
      {
        $match: {
          authType: 'saml'
        }
      },
      {
        $addFields: {
          moduleCount: { $size: { $ifNull: ["$completedModules", []] } },
        },
      },
      {
        $bucket: {
          groupBy: "$moduleCount",
          boundaries: [0, 1, 6, 11, Infinity],
          default: "Unbekannt",
          output: {
            count: { $sum: 1 },
          },
        },
      },
      {
        $addFields: {
          label: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0 Module" },
                {
                  case: { $and: [{ $gte: ["$_id", 1] }, { $lt: ["$_id", 6] }] },
                  then: "1-5 Module",
                },
                {
                  case: {
                    $and: [{ $gte: ["$_id", 6] }, { $lt: ["$_id", 11] }],
                  },
                  then: "6-10 Module",
                },
                { case: { $gte: ["$_id", 11] }, then: "11+ Module" },
              ],
              default: "Unbekannt",
            },
          },
        },
      },
    ]);
    // frequency of modules as completed module
    const frequencyModulesAsCompleted = await User.aggregate([
      {
        $match: {
          authType: 'saml'
        }
      },
      { $unwind: "$completedModules" },
      { $group: { _id: "$completedModules.acronym", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    // number of study plans that where updated in the last month
    const frequencyStudyPlans = await StudyPlan.countDocuments({
      updatedAt: { $gte: oneMonthAgo },
    });
    // cluster of how often study plans where updated
    const frequencyStudyPlansClustered = await StudyPlan.aggregate([
      {
        $bucket: {
          groupBy: "$__v",
          boundaries: [0, 1, 10, 50, Infinity],
          default: "other",
          output: { count: { $sum: 1 } },
        },
      },
      {
        $addFields: {
          label: {
            $switch: {
              branches: [
                {
                  case: { $and: [{ $gte: ["$_id", 0] }, { $lt: ["$_id", 2] }] },
                  then: "Version 0-1",
                },
                {
                  case: {
                    $and: [{ $gte: ["$_id", 1] }, { $lt: ["$_id", 11] }],
                  },
                  then: "Version 2-10",
                },
                {
                  case: {
                    $and: [{ $gte: ["$_id", 10] }, { $lt: ["$_id", 51] }],
                  },
                  then: "Version 11-50",
                },
                { case: { $gte: ["$_id", 50] }, then: "Version 51+ " },
              ],
              default: "Unbekannt",
            },
          },
        },
      },
    ]);
    // frequency of planned courses within semester plan
    const frequencyPlannedCourses = await StudyPlan.aggregate([
      { $unwind: "$semesterPlans" },
      { $unwind: "$semesterPlans.courses" },
      {
        $group: {
          _id: {
            id: "$semesterPlans.courses.id",
            name: "$semesterPlans.courses.name",
            semester: "$semesterPlans.semester",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // create json for report
    const result = {
      allUsers: allUsers,
      activeUsers: activeUsers,
      lastActiveUsersHistory: lastActiveUsersHistory.map((history) => ({
        name: `${history._id.month}.${history._id.year}`,
        count: history.count,
      })),
      frequencyModuleStatus: frequencyModuleStatus.map((status) => ({
        name: status._id,
        count: status.count,
      })),
      frequencyStudyProgrammes: frequencyStudyProgrammes.map((programme) => ({
        name: programme._id,
        count: programme.count,
      })),
      frequencyDuration: frequencyDuration.map((duration) => ({
        name: duration._id,
        count: duration.count,
      })),
      frequencyStartSemester: frequencyStartSemester.map((semester) => ({
        name: semester._id,
        count: semester.count,
      })),
      frequencyCompletedModules: frequencyCompletedModules.map((group) => ({
        name: group.label,
        count: group.count,
      })),
      frequencyModulesAsCompleted: frequencyModulesAsCompleted.map(
        (module) => ({
          name: module._id,
          count: module.count,
        })
      ),
      frequencyStudyPlans: frequencyStudyPlans,
      frequencyStudyPlansClustered: frequencyStudyPlansClustered.map(
        (group) => ({
          name: group.label,
          count: group.count,
        })
      ),
      frequencyPlannedCourses: frequencyPlannedCourses.map((course) => ({
        id: course._id.id,
        name: course._id.name,
        semester: course._id.semester,
        count: course.count,
      })),
    };

    res.status(200).json(result);
  } catch (error) {
    logError(error);
    next(new BadRequestError("Fehler beim Abrufen der Reporting-Daten"));
  }
}

async function crawlFlexNow(semester: string): Promise<string> {
  if (semester.endsWith("s")) {
    semester = semester.replace("s", "1");
  } else {
    semester = semester.replace("w", "2");
  }
  const url = process.env.FN_MHBS_URL + semester;
  let result = new Promise<string>((resolve, reject) => {
    const data = new URLSearchParams();
    data.append(
      "login",
      process.env.FN_LOGIN ? process.env.FN_LOGIN : ""
    );
    data.append(
      "password",
      process.env.FN_PW ? process.env.FN_PW : ""
    );

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const req = https.request(url, options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "utf-8"));
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          const buffer = Buffer.concat(chunks);
          const ansiString = buffer.toString("utf-8");
          resolve(ansiString);
        } else {
          reject(
            new Error(`Request failed with status code ${res.statusCode}`)
          );
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(data.toString());
    req.end();
  });
  return result;
}

async function processFlexNowData(xml: string): Promise<string[]> {
  const dep = await transform(xml, depTemplate);
  const persons = await transform(xml, personTemplate);
  const sps = await transform(xml, spTemplate);
  const mhbs = await transform(xml, mhbTemplate);
  const mgs = await transform(xml, mgTemplate);
  const modules = await transform(xml, modTemplate);
  const mc = await transform(xml, mcTemplate);
  const sp2mhb = await transform(xml, sp2mhbTemplate);
  const mhb2mg = await transform(xml, mhb2mgTemplate);
  const mg2mg = await transform(xml, mg2mgTemplate);
  const mg2mod = await transform(xml, mg2modTemplate);
  const m2mc = await transform(xml, m2mcTemplate);
  const per2mc = await transform(xml, per2mcTemplate);
  const modExams = await transform(xml, moduleExamTemplate);
  // module dependencies via own n:m relational table, currently not in use but available.
  const modDepend = await transform(xml, modDepTemplate);

  // add or update departments in database
  const depMessage = await upsertDeparmtents(dep);

  // add persons to database
  const personsMessage = await upsertPersons(persons);

  // add sp to database
  const spsMessage = await upsertStudyprogrammes(sps);

  // add module handbooks and beyond to database, only when adding sps not resulting in an error
  if (spsMessage.startsWith("ERROR")) {
    return [depMessage, personsMessage, spsMessage];
  }
  const mhbsMessage = await upsertModuleHandbooks(mhbs);

  // add module groups to database
  const mgsMessage = await upsertModuleGroups(mgs);

  // add modules to database
  const modulesMessage = await upsertModules(modules);

  // add module exams to database, only when adding modules not resulting in an error

  if (modulesMessage.startsWith("ERROR")) {
    return [depMessage, personsMessage, spsMessage, mhbsMessage, mgsMessage, modulesMessage]
  }
  const modExamMessage = await upsertModuleExams(modExams);

  // add modulecourses to database
  const modCoursesMessage = await upsertModuleCourses(mc);

  // add moduleHandbook2modulegroup to database, only when adding mhbs and mgs not resulting in an error

  if (
    mhbsMessage.startsWith("ERROR") ||
    mgsMessage.startsWith("ERROR")
  ) {
    return [depMessage, personsMessage, spsMessage, mhbsMessage, mgsMessage, modulesMessage, modExamMessage, modCoursesMessage]
  }

  const resultSp2Mhb = await prisma.sp2Mhb.createMany({
    data: sp2mhb,
    skipDuplicates: true,
  })

  const resultMhb2Mg = await prisma.mhb2Mg.createMany({
    data: mhb2mg,
    skipDuplicates: true,
  });

  // add modulegroup2modulegroup to database, only when adding mgs not resulting in an error
  let resultMg2Mg = await prisma.mg2Mg.createMany({
    data: mg2mg,
    skipDuplicates: true,
  });

  // add modulegroup2module to database, only when adding mgs and modules not resulting in an error
  let resultMg2Mod = await prisma.mod2Mg.createMany({
    data: mg2mod,
    skipDuplicates: true,
  });

  // filter invalid values in m2mc connection
  for (let el of m2mc) {
    if (Number.isNaN(el.ects)) {
      el.ects = undefined;
    }
  }
  const resultMod2Mc = await prisma.mod2ModCourse.createMany({
    data: m2mc,
    skipDuplicates: true,
  });

  // module dependencies via own n:m relational table, currently not in use but available.
  const resultModDepend = await prisma.moduleDep.createMany({
    data: modDepend,
    skipDuplicates: true,
  });

  // add connection between persons and modulecourse from course starting
  // transform data, since multiple pIds are contained
  let person2ModCourse = [];
  for (let entry of per2mc) {
    //entry consists of pId-Array and mcId
    for (let pId of entry.pIds) {
      person2ModCourse.push({
        pId: pId,
        mcId: entry.mcId,
      });
    }
  }
  const resultPer2Mc = await prisma.person2ModCourse.createMany({
    data: person2ModCourse,
    skipDuplicates: true,
  });
  return [
    depMessage,
    personsMessage,
    spsMessage,
    mhbsMessage,
    mgsMessage,
    modulesMessage,
    modExamMessage,
    modCoursesMessage,
    `Studyprogramme2Modulehandbook: ${sp2mhb.length} queried - ${resultSp2Mhb.count} added`,
    `Modulehandbook2Modulegroup: ${mhb2mg.length} queried - ${resultMhb2Mg.count} added`,
    `Modulegroup2Modulegroup: ${mg2mg.length} queried - ${resultMg2Mg.count} added`,
    `Modulegroup2Module: ${mg2mod.length} queried - ${resultMg2Mod.count} added`,
    `Module2ModuleCourse: ${m2mc.length} queried - ${resultMod2Mc.count} added`,
    `Person2ModuleCourse: ${person2ModCourse.length} queried - ${resultPer2Mc.count} added`,
    `Module Dependencies: ${modDepend.length} queried - ${resultModDepend.count} added`,
  ];
}
