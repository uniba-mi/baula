import { NextFunction, Request, Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import { StudyPlan, User, Recommendation, SemesterPlan } from "../../../database/mongo";
import {
  validateAndReturnSemester,
  validateAndReturnUser,
  validateObjectId,
} from "../../../shared/helpers/custom-validator";
import { Types } from "mongoose";
import { PathCourse, PathModule } from "../../../../../../interfaces/study-path";
import { BadRequestError, logError, NotFoundError } from "../../../shared/error";
import validator from "validator";
import {
  ModuleFeedback,
  User as UserClient,
  UserServer,
} from "../../../../../../interfaces/user";
import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import { ExtendedJob, Job } from "../../../../../../interfaces/job";
import { transform } from "camaro";
import {
  studyPathTemplate,
  metaDataTemplate
} from "../../../templates/student-fn2api";
import https from "https";
import { findMatchingModuleIndex } from "../../../shared/helpers/plan-helper";
import { decrypt } from "../../../shared/utils/crypto";

const prisma = new PrismaClient();

// Get Userdata via ShibId
export async function getUser(req: Request, res: Response, next: NextFunction) {
  const user = req.user as UserServer; // Use the user attached by the extractUser middleware
  try {
    const userClient = await transformUserStudyPath(user);
    res.status(200).json(userClient);
  } catch (error) {
    logError(error);
    next(
      new BadRequestError(
        "Beim Formatieren der Daten ist ein Fehler aufgetreten."
      )
    );
  }
}

// Create user
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sentUser = req.body.user;

  const user = validateAndReturnUser({
    ...sentUser,
    studyPath: undefined,
    completedModules: sentUser.studyPath.completedModules,
    topics: [],
    favouriteModulesAcronyms: [],
    excludedModulesAcronyms: [],
    moduleFeedback: []
  })

  if(user) {
    try {
      const createdUser = await User.create({
        ...user
      })
      // create User
      const userClient = await transformUserStudyPath(createdUser);
      res.status(200).json(userClient)
    } catch(error) {
      console.error(error)
      next(new BadRequestError("Es ist ein Fehler aufgetreten."));
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

// Update user requests
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = validateAndReturnUser(req.body.user);
  //check validity of user
  if (user) {
    try {
      const userServer = await User.findById({ _id: user._id }).exec();
      if (userServer) {
        userServer.shibId = user.shibId;
        userServer.roles = user.roles;
        userServer.startSemester = user.startSemester;
        userServer.duration = user.duration;
        userServer.maxEcts = user.maxEcts;
        userServer.sps = user.sps;
        userServer.fulltime = user.fulltime;
        userServer.completedModules = user.completedModules;
        userServer.dashboardSettings = user.dashboardSettings;
        userServer.timetableSettings = user.timetableSettings;
        userServer.favouriteModulesAcronyms = user.favouriteModulesAcronyms;
        userServer.excludedModulesAcronyms =
          user.excludedModulesAcronyms;
        userServer.topics = user.topics;
        userServer.hints = user.hints;
        userServer.consents = user.consents;
        userServer.moduleFeedback = user.moduleFeedback;
        await userServer.save();
        const userClient = await transformUserStudyPath(userServer);
        res.status(200).json(userClient);
      } else {
        next(new NotFoundError("Keinen Nutzer gefunden"));
      }
    } catch (error: any) {
      next(new BadRequestError());
    }
  } else {
    next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
  }
}

// for editing a specific PathModule in the STUDYPATH by _id not acronym
export async function updateModuleInStudyPath(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const _id = validateObjectId(req.body._id) ? req.body._id : undefined;
  const acronym =
    typeof req.body.acronym === "string" && req.body.acronym.trim().length > 0
      ? req.body.acronym
      : undefined;
  const name = typeof req.body.name == "string" ? req.body.name : undefined;
  const status =
    typeof req.body.status == "string" ? req.body.status : undefined;
  const ects = validator.isInt(String(req.body.ects))
    ? Number(req.body.ects)
    : undefined;
  const grade = typeof req.body.grade == "number" ? req.body.grade : undefined;
  const semester = validator.matches(
    String(req.body.semester),
    /\d{4}((w)|(s))/g
  )
    ? req.body.semester
    : undefined;
  const userReq = req.user as UserServer;
  const isUserGenerated = req.body.isUserGenerated;
  const flexNowImported = req.body.flexNowImported;
  const mgId = typeof req.body.mgId == "string" ? req.body.mgId : undefined;

  // check if all values are contained in body
  if (
    acronym &&
    name &&
    status &&
    userReq._id &&
    ects &&
    semester &&
    mgId &&
    isUserGenerated !== undefined &&
    flexNowImported !== undefined
  ) {
    try {
      let user = await User.findById(userReq._id);
      if (user) {
        // check if completed Modules exist (for legacy reasons)
        if (!user.completedModules) {
          user.completedModules = [];
        }

        // convert _id to ObjectId for proper comparison
        const objectId = new Types.ObjectId(_id as string);

        // check if the module already exists using ObjectId comparison
        const exist = user.completedModules.find((el) => {
          if (el._id) {
            return el._id.toString() === objectId.toString();
          }
          return false;
        });

        if (exist) {
          exist.acronym = acronym;
          exist.name = name;
          exist.ects = ects;
          exist.status = status;
          exist.semester = semester;
          exist.grade = grade;
          exist.mgId = mgId;
          exist.isUserGenerated = isUserGenerated;
          exist.flexNowImported = flexNowImported;
        } else {
          user.completedModules.push({
            _id: _id || new mongoose.Types.ObjectId(), // use _id if provided (in case of user generated modules), else generate a new one
            acronym,
            name,
            ects,
            status,
            grade,
            semester,
            mgId,
            isUserGenerated,
            flexNowImported,
          });
        }
        const result = await user.save();
        const userClient = await transformUserStudyPath(result);
        res.status(200).json(userClient.studyPath);
      } else {
        next(new NotFoundError("Keinen Nutzer gefunden"));
      }
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new NotFoundError("Parameter fehlen"));
  }
}

// update several modules at once
export async function updateStudyPath(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userReq = req.user as UserServer;
  const modulesToUpdate: PathModule[] = req.body.completedModules;

  if (!userReq._id || !Array.isArray(modulesToUpdate)) {
    return next(new BadRequestError("Ungültige Parameter"));
  }

  try {
    const user = await User.findById(userReq._id);
    if (!user) {
      return next(new NotFoundError("Nutzer wurde nicht gefunden"));
    }

    if (!user.completedModules) {
      user.completedModules = [];
    }

    modulesToUpdate.forEach((module) => {
      // convert string _id to ObjectId for comparison if it exists
      const moduleObjectId = module._id ? new Types.ObjectId(module._id) : null;

      const indexToUpdate = findMatchingModuleIndex(
        user.completedModules,
        module,
        moduleObjectId
      );

      if (indexToUpdate > -1) {
        // update existing module for the current semester
        Object.assign(user.completedModules[indexToUpdate], module);
      } else {
        // add new module
        if (
          !user.completedModules.some(
            (existingMod) =>
              moduleObjectId?.toString() &&
              existingMod._id &&
              moduleObjectId.toString() === existingMod._id.toString()
          )
        ) {
          user.completedModules.push(module);
        }
      }
    });

    const result = await user.save();
    const userClient = await transformUserStudyPath(result);
    res.status(200).json(userClient.studyPath);
  } catch (error) {
    next(
      new BadRequestError("Studienverlauf konnte nicht aktualisiert werden")
    );
  }
}

// semester transition, adding modules of one semester to study path
export async function finishSemester(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userReq = req.user as UserServer;
  const modulesToUpdate: PathModule[] = req.body.completedModules;
  const modulesToDrop: PathModule[] = req.body.droppedModules;

  if (!userReq._id || !Array.isArray(modulesToUpdate)) {
    return next(new BadRequestError("Ungültige Parameter"));
  }

  try {
    const user = await User.findById(userReq._id);
    if (!user) {
      return next(new NotFoundError("Nutzer wurde nicht gefunden"));
    }

    if (!user.completedModules) {
      user.completedModules = [];
    }

    // remove the modules from the semester which should not land in the finished semester
    modulesToDrop.forEach((module) => {
      const moduleObjectId = module._id ? new Types.ObjectId(module._id) : null;

      const indexToDelete = findMatchingModuleIndex(
        user.completedModules,
        module,
        moduleObjectId
      );

      if (indexToDelete > -1) {
        user.completedModules.splice(indexToDelete, 1);
      }
    });

    modulesToUpdate.forEach((module) => {
      const moduleObjectId = module._id ? new Types.ObjectId(module._id) : null;

      const modulePassedInAnotherSemester = user.completedModules.some(
        (existingMod) =>
          !module.isUserGenerated &&
          existingMod.acronym === module.acronym &&
          existingMod.semester !== module.semester &&
          existingMod.status === "passed"
      );

      // if it was passed in other semesters, remove it from the current semester
      if (modulePassedInAnotherSemester) {
        user.completedModules = user.completedModules.filter((existingMod) => {
          return !(
            existingMod.semester === module.semester &&
            ((moduleObjectId?.toString() &&
              existingMod._id &&
              moduleObjectId.toString() === existingMod._id.toString()) ||
              (!module.isUserGenerated &&
                existingMod.acronym === module.acronym))
          );
        });
        return;
      }

      const indexToUpdate = findMatchingModuleIndex(
        user.completedModules,
        module,
        moduleObjectId
      );

      if (indexToUpdate > -1) {
        // update existing module for the current semester
        Object.assign(user.completedModules[indexToUpdate], module);
      } else {
        // add new module
        if (
          !user.completedModules.some(
            (existingMod) =>
              moduleObjectId?.toString() &&
              existingMod._id &&
              moduleObjectId.toString() === existingMod._id.toString()
          )
        ) {
          if (!module._id || module._id === null) {
            module._id = new Types.ObjectId().toString();
          }
          user.completedModules.push({ ...module });
        }
      }
    });

    const result = await user.save();
    const userClient = await transformUserStudyPath(result);
    res.status(200).json(userClient.studyPath);
  } catch (error) {
    next(
      new BadRequestError(
        "Semester konnte nicht zum Studienverlauf hinzugefügt werden."
      )
    );
  }
}

/** Update of competence aims in database
 * @param req contains aims in form of CompAim[] and uId to validate user
 * @param res
 * @param next */
export async function updateCompetenceAims(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  const aims = req.body.aims;

  if (user._id && aims) {
    try {
      const update = await User.updateOne(
        { _id: user._id },
        { compAims: aims }
      ).exec();
      if (update.modifiedCount > 0) {
        res
          .status(200)
          .json("Die Kompetenzziele wurden erfolgreich aktualisiert.");
      } else {
        next(new BadRequestError("Es ist etwas schief gegangen..."));
      }
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(
      new BadRequestError(
        "Die eingegebenen Daten sind unvollständig oder ungültig."
      )
    );
  }
}

export async function deleteModuleFromStudyPath(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = typeof req.body.id == "string" ? req.body.id : undefined;
  const semester = validateAndReturnSemester(req.body.semester);
  const userReq = req.user as UserServer;

  if (id && semester && userReq._id) {
    try {
      // find user
      const user = await User.findById(userReq._id);
      if (user) {
        const index = user.completedModules.findIndex((el) => el._id == id);
        user.completedModules.splice(index, 1);
        const result = await user.save();
        const userClient = await transformUserStudyPath(result);
        res.status(200).json(userClient.studyPath);
      } else {
        next(new NotFoundError("Es wurde kein vergangenes Semester gefunden."));
      }
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new BadRequestError());
  }
}

export async function deleteStudyPath(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  try {
    if (user.completedModules) {
      const result = await User.updateOne(
        { _id: user._id },
        {
          $set: {
            completedModules: [],
          },
        }
      );
      res.status(200).json(result);
    } else {
      next(new NotFoundError("Kein passender Nutzer gefunden"));
    }
  } catch (error) {
    next(new BadRequestError());
  }
}

export async function deleteFavouriteModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as UserServer;
    if (user && user.favouriteModulesAcronyms) {
      const result = await User.updateOne(
        { _id: user._id },
        {
          $set: {
            favouriteModulesAcronyms: [],
          },
        }
      );
      res.status(200).json(result);
    } else {
      next(new NotFoundError("Kein passender Nutzer gefunden"));
    }
  } catch (error) {
    next(new BadRequestError());
  }
}

export async function deleteExcludedModules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as UserServer;
    if (user && user.excludedModulesAcronyms) {
      const result = await User.updateOne(
        { _id: user._id },
        {
          $set: {
            excludedModulesAcronyms: [],
          },
        }
      );
      res.status(200).json(result);
    } else {
      next(new NotFoundError("Kein passender Nutzer gefunden"));
    }
  } catch (error) {
    next(new BadRequestError());
  }
}

export async function deleteExcludedModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const acronym =
    typeof req.params.acronym == "string" ? req.params.acronym : undefined;
  const user = req.user as UserServer;
  try {
    if (acronym && user && user.excludedModulesAcronyms) {
      const result = await User.updateOne(
        { _id: user._id },
        {
          $pull: {
            excludedModulesAcronyms: acronym,
          },
        }
      );
      res.status(200).json(result);
    } else {
      next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
  } catch (error) {
    next(
      new BadRequestError("Beim Löschen des Moduls ist ein Fehler aufgetreten.")
    );
  }
}

export async function updateDashboardView(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userReq = req.user as UserServer;
  const name = validator.isAlpha(String(req.body.chartName), undefined, {
    ignore: "-",
  })
    ? req.body.chartName
    : undefined;

  if (userReq._id && name) {
    const user = await User.findById(userReq._id);
    if (user) {
      const chart = user.dashboardSettings.find((el) => el.key == name);
      if (chart) {
        chart.visible = !chart.visible;
        const result = await user.save();
        res.status(200).send(result.dashboardSettings);
      } else {
        next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
      }
    } else {
      next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
    }
  } else {
    next(new BadRequestError());
  }
}

// TODO: currently just updates current setting, extend if needed
export async function updateTimetableSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userReq = req.user as UserServer;
  const showWeekends = Boolean(req.body.showWeekends);

  try {
    const user = await User.findById(userReq._id);
    if (user) {
      let setting = user.timetableSettings.find((el) => "showWeekends" in el);

      if (setting) {
        setting.showWeekends = showWeekends;
      } else {
        // add showWeekends setting if it does not exist
        user.timetableSettings.push({ showWeekends });
      }

      const result = await user.save();

      res.status(200).send(result.timetableSettings);
    } else {
      next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
    }
  } catch (error) {
    next(new BadRequestError());
  }
}

export async function updateFavouriteModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userReq = req.user as UserServer;
  const acronym =
    typeof req.body.acronym == "string" ? req.body.acronym : undefined;

  if (userReq._id && acronym) {
    const user = await User.findById(userReq._id);
    if (user) {
      const index = user.favouriteModulesAcronyms.indexOf(acronym);
      if (index === -1) {
        // add module if it is not a favourite yet
        user.favouriteModulesAcronyms.push(acronym);
      } else {
        // delete module if it is already there
        user.favouriteModulesAcronyms.splice(index, 1);
      }
      const result = await user.save();
      res.status(200).send(result.favouriteModulesAcronyms);
    } else {
      next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
    }
  } else {
    next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
  }
}

export async function updateExcludedModule(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  const acronym =
    typeof req.body.acronym == "string" ? req.body.acronym : undefined;

  if (user._id && acronym) {
    const userDb = await User.findById(user._id);
    if (userDb) {
      const index = user.excludedModulesAcronyms.indexOf(acronym);
      if (index === -1) {
        // add module if it is not a favourite yet
        userDb.excludedModulesAcronyms.push(acronym);
      } else {
        // delete module if it is already there
        userDb.excludedModulesAcronyms.splice(index, 1);
      }
      const result = await userDb.save();
      res.status(200).send(result.excludedModulesAcronyms);
    } else {
      next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
    }
  } else {
    next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
  }
}

export async function toggleTopic(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  const topic = req.body.topic;

  if (user._id && topic) {
    try {
      const userDocument = await User.findById(user._id)
        .select("topics")
        .exec();

      const updateOperation = userDocument?.topics.includes(topic)
        ? { $pull: { topics: topic } } // remove if exists
        : { $addToSet: { topics: topic } }; // add if does not exist

      await User.updateOne({ _id: user._id }, updateOperation).exec();

      const updatedUser = await User.findById(user._id).select("topics").exec();

      res.status(200).json({ topics: updatedUser?.topics });
    } catch (error) {
      next(new BadRequestError("Thema konnte nicht aktualisiert werden."));
    }
  } else {
    next(new BadRequestError());
  }
}

export async function updateHint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userReq = req.user as UserServer;
  const key = typeof req.body.key == "string" ? req.body.key : undefined;
  const hasConfirmed = Boolean(req.body.hasConfirmed);

  if (userReq._id && key && hasConfirmed) {
    const user = await User.findById(userReq._id);
    if (user && user.hints) {
      const hintIndex = user.hints.findIndex((hint) => hint.key === key);
      if (hintIndex !== -1) {
        user.hints[hintIndex].hasConfirmed = hasConfirmed;
        await user.save();
        res.status(200).send(user.hints);
      } else {
        res.status(404).send("Hinweis nicht gefunden");
      }
    } else {
      next(new NotFoundError("Nutzer wurde nicht gefunden."));
    }
  } else {
    next(new BadRequestError());
  }
}

export async function addConsents(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userReq = req.user as UserServer;
  const ctype =
    typeof req.body.ctype === "string" ? req.body.ctype.trim() : undefined;
  const hasConfirmed = Boolean(req.body.hasConfirmed);
  const hasResponded =
    req.body.hasResponded !== undefined ? Boolean(req.body.hasResponded) : true; // default is true here (we're obviously updating)
  const timestamp = req.body.timestamp
    ? new Date(req.body.timestamp)
    : undefined;

  if (
    userReq._id &&
    ctype !== undefined &&
    hasConfirmed !== undefined &&
    timestamp !== undefined
  ) {
    try {
      const user = await User.findById(userReq._id);
      if (user) {
        const newConsent = {
          ctype: ctype,
          hasConfirmed: hasConfirmed,
          hasResponded: hasResponded,
          timestamp: timestamp,
        };

        user.consents.push(newConsent);

        await user.save();

        res.status(200).send(user.consents);
      } else {
        res.status(404).send("Nutzer wurde nicht gefunden.");
      }
    } catch (error) {
      next(new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
    }
  } else {
    next(new BadRequestError());
  }
}

export async function updateModuleFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userReq = req.user as { _id: string };
  const feedback: ModuleFeedback = req.body.feedback;

  if (!userReq._id || !feedback?.acronym) {
    return next(new BadRequestError("Ungültige Eingabedaten."));
  }

  try {
    const user = await User.findById(userReq._id);

    if (!user) {
      return res.status(404).send("Nutzer wurde nicht gefunden.");
    }

    if (!user.moduleFeedback) {
      user.moduleFeedback = [];
    }

    // existing feedback?
    const existingFeedbackIndex = user.moduleFeedback.findIndex(
      (mf: ModuleFeedback) => mf.acronym === feedback.acronym
    );

    // update changed properties
    if (existingFeedbackIndex > -1) {
      // Update only the properties that are different, excluding the acronym
      const existingFeedback = user.moduleFeedback[existingFeedbackIndex];
      const ratings: (keyof Omit<ModuleFeedback, "acronym">)[] = [
        "similarmods",
        "similarchair",
        "priorknowledge",
        "contentmatch",
      ];

      ratings.forEach((key) => {
        if (
          feedback[key] !== undefined &&
          feedback[key] !== existingFeedback[key]
        ) {
          existingFeedback[key] = feedback[key];
        }
      });
    } else {
      user.moduleFeedback.push(feedback);
    }

    await user.save();
    res.status(200).send(user.moduleFeedback);
  } catch (error) {
    console.error("Error updating module feedback:", error);
    next(new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
  }
}

export async function deleteModuleFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const userReq = req.user as UserServer;
  const feedback: ModuleFeedback = req.body.feedback;

  if (!userReq._id || !feedback?.acronym) {
    return next(new BadRequestError("Ungültige Eingabedaten."));
  }

  try {
    const user = await User.findById(userReq._id);

    if (!user) {
      return res.status(404).send("Nutzer wurde nicht gefunden.");
    }

    if (!user.moduleFeedback) {
      user.moduleFeedback = [];
    }

    // remove feedback for the given acronym
    user.moduleFeedback = user.moduleFeedback.filter(
      (mf: ModuleFeedback) => mf.acronym !== feedback.acronym
    );

    await user.save();
    res.status(200).send(user.moduleFeedback);
  } catch (error) {
    next(new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
  }
}

export async function deleteJob(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as UserServer;
  const jobId = validateObjectId(req.body.id) ? req.body.id : undefined;

  if (jobId) {
    try {
      // delete job from user
      await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { jobs: { _id: jobId } } }
      );
      // delete job from recommendation
      const recommendation = await Recommendation.findOne({ userId: user._id });
      if (recommendation && recommendation.recommendedMods) {
        recommendation.recommendedMods.forEach((mod) => {
          mod.source = mod.source.filter(
            (source) => source.identifier !== jobId
          );
        });
        recommendation.recommendedMods = recommendation.recommendedMods.filter(
          (mod) => mod.source.length > 0
        );
        await recommendation.save();
      }
      return res.status(200).json("Job deleted successfully.");
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new NotFoundError("No valid job id found!"));
  }
}

export async function deleteUser(
  req: JWTRequest,
  res: Response,
  next: NextFunction
) {
  let user: any = req.user;
  let shibId = undefined;
  if (user && user.shibId) {
    shibId = user.shibId;
  }
  if (shibId) {
    const user = await User.findOne().byShibId(shibId);
    if (user) {
      try {
        const deletedStudyPlans = await StudyPlan.deleteMany({
          userId: user._id,
        });
        const deletedSemesterPlans = await SemesterPlan.deleteMany({
          userId: user._id,
        })
        const deletedRecommendations = await Recommendation.deleteMany({
          userId: user._id,
        })
        const deletedUser = await User.findByIdAndDelete(user._id);
        if (deletedStudyPlans && deletedUser && deletedSemesterPlans && deletedRecommendations) {
          res.status(200).json("Der Nutzer wurde gelöscht!");
        } else {
          next(
            new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten.")
          );
        }
      } catch (error) {
        next(
          new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten.")
        );
      }
    } else {
      next(new NotFoundError("Es wurde kein Nutzer gefunden."));
    }
  } else {
    next(new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."));
  }
}

async function transformUserStudyPath(user: UserServer): Promise<UserClient> {
  const completedModules = user.completedModules ? user.completedModules : [];
  let completedCourses: PathCourse[] = [];
  const studyPlans = await StudyPlan.find({
    userId: user._id,
  });
  if (studyPlans) {
    const semesterPlans = studyPlans.map((el) => el.semesterPlans).flat(1);
    if (semesterPlans) {
      for (const semesterPlan of semesterPlans) {
        const semester = semesterPlan.semester;
        for (let course of semesterPlan.courses) {
          completedCourses.push({
            id: course.id,
            name: course.name,
            status: course.status,
            ects: course.ects,
            sws: course.sws,
            contributeTo: course.contributeTo,
            contributeAs: course.contributeAs,
            semester,
          });
        }
      }
    }
  }

  const jobs = await transformJobs(user._id, user.jobs);

  return new Promise<UserClient>((resolve, reject) => {
    resolve({
      _id: user._id,
      shibId: user.shibId,
      roles: user.roles,
      authType: user.authType,
      compAims: user.compAims,
      startSemester: user.startSemester,
      duration: user.duration,
      maxEcts: user.maxEcts,
      sps: user.sps,
      fulltime: user.fulltime,
      dashboardSettings: user.dashboardSettings,
      timetableSettings: user.timetableSettings,
      favouriteModulesAcronyms: user.favouriteModulesAcronyms,
      excludedModulesAcronyms: user.excludedModulesAcronyms,
      hints: user.hints,
      consents: user.consents,
      topics: user.topics,
      moduleFeedback: user.moduleFeedback,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      studyPath: {
        completedModules,
        completedCourses,
      },
      jobs: jobs,
    });
  });
}

async function transformJobs(
  userId: string,
  jobs: Job[] | undefined
): Promise<ExtendedJob[]> {
  if (jobs) {
    const recModules = await Recommendation.findOne({ userId });
    const transformedJobs: ExtendedJob[] = [];
    if (recModules) {
      for (const job of jobs) {
        const jobModules = recModules.recommendedMods?.filter((mod) => {
          return mod.source.find(
            (source) => source.identifier === job._id.toString()
          )
            ? true
            : false;
        });
        if (jobModules) {
          transformedJobs.push({
            _id: job._id,
            title: job.title,
            description: job.description,
            inputMode: job.inputMode,
            keywords: job.keywords,
            embeddingId: job.embeddingId,
            recModules: jobModules,
          });
        }
      }
      return transformedJobs;
    } else {
      return jobs.map((job) => {
        return {
          _id: job._id,
          title: job.title,
          description: job.description,
          inputMode: job.inputMode,
          keywords: job.keywords,
          embeddingId: job.embeddingId,
          recModules: [],
        };
      });
    }
  } else {
    return [];
  }
}

export async function crawlStudentDataViaFlexNow(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const baId = decrypt((req.session as any).passport.user.baId);
    const url = process.env.FN_STUDENT_URL
      ? process.env.FN_STUDENT_URL + baId
      : "";
    const importStudyPath = req.body.importStudyPath;
    if (url) {
      const result = await new Promise<string>((resolve, reject) => {
        const data = new URLSearchParams();
        data.append(
          "login",
          process.env.FN_LOGIN ?? ""
        );
        data.append(
          "password",
          process.env.FN_PW ?? ""
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
            chunks.push(
              Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "binary")
            );
          });
          res.on("end", () => {
            if (res.statusCode === 200) {
              const buffer = Buffer.concat(chunks);
              const ansiString = buffer.toString("binary");
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
      const metadata = await transform(result, metaDataTemplate)
      const studyPath = importStudyPath ? await transform(result, studyPathTemplate) : undefined

      res.json({
        metadata,
        studyPath
      });
    } else {
      res.status(404);
    }
  } catch (error) {
    next(error);
  }
}