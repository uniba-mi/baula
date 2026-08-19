import { NextFunction, Request, Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import {
  StudyPlan,
  User,
  Recommendation,
  SemesterPlan,
} from "../../../database/mongo";
import {
  validateAndReturnSemester,
  validateAndReturnUser,
  validateObjectId,
} from "../../../shared/helpers/custom-validator";
import { Types } from "mongoose";
import { PathCourse, PathModule } from "@interfaces/study-path";
import {
  BadRequestError,
  logError,
  NotFoundError,
} from "../../../shared/error";
import validator from "validator";
import {
  ModuleFeedback,
  StudyPlanSettings,
  User as UserClient,
  UserServer,
} from "@interfaces/user";
import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import { ExtendedJob, Job } from "@interfaces/job";
import { transform } from "camaro";
import {
  studyPathTemplate,
  metaDataTemplate,
} from "../../../templates/student-fn2api";
import https from "https";
import { findMatchingModuleIndex } from "../../../shared/helpers/plan-helper";
import { decrypt } from "../../../shared/utils/crypto";
import { FnMetaData, FnStudyProgramme } from "@interfaces/fn-user";
import {
  findAndBuildModuleHandbookByIdAndVersion,
  iterateOverMgsAndReturnMgs,
  iterateOverMgsAndReturnModules,
} from "../../../shared/helpers/module-helpers";
import { Semester } from "../../../../../../interfaces/semester";
import * as fs from "fs";
import { Module } from "../../../../../../interfaces/module";

const prisma = new PrismaClient();

// Get Userdata via ShibId
export async function getUser(req: Request, res: Response, next: NextFunction) {
  const user = req.user as UserServer; // Use the user attached by the extractUser middleware
  try {
    // check users studyprograms and update if empty status for legacy users
    if (user._id) {
      const userServer = await User.findById({ _id: user._id }).exec();
      if (userServer && userServer.sps) {
        for (let sp of userServer.sps) {
          if (!sp.status) {
            sp.status = "Immatrikuliert";
          }
        }
        await userServer.save();
        const userClient = await transformUserStudyPath(userServer);

        res.status(200).json(userClient);
      } else {
        next(new NotFoundError("Es konnte kein Nutzer gefunden werden."));
      }
    } else {
      const userClient = await transformUserStudyPath(user);
      res.status(200).json(userClient);
    }
  } catch (error) {
    logError(error);
    next(
      new BadRequestError(
        "Beim Formatieren der Daten ist ein Fehler aufgetreten.",
      ),
    );
  }
}

// Create user
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sentUser = req.body.user;
  // shibId and roles must come from the authenticated session (set by passport from
  // SAML/local login), never from the client body, to prevent role/identity spoofing
  const sessionUser = req.user as UserServer;

  const user = validateAndReturnUser({
    ...sentUser,
    shibId: sessionUser.shibId,
    roles: sessionUser.roles,
    studyPath: undefined,
    completedModules: sentUser.studyPath.completedModules,
    topics: [],
    favouriteModulesAcronyms: [],
    excludedModulesAcronyms: [],
    moduleFeedback: [],
  });

  if (user) {
    try {
      const createdUser = await User.create({
        ...user,
      });
      // create User
      const userClient = await transformUserStudyPath(createdUser);
      res.status(200).json(userClient);
    } catch (error) {
      console.error(error);
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
  next: NextFunction,
) {
  // the authenticated session's _id is the only trustworthy identifier for which
  // record may be updated - the client-supplied user._id must never be used for lookup,
  // otherwise any user could overwrite another user's document
  const sessionUser = req.user as UserServer;
  const user = validateAndReturnUser(req.body.user);
  //check validity of user
  if (user) {
    try {
      const userServer = await User.findById({ _id: sessionUser._id }).exec();
      if (userServer) {
        // shibId and roles are identity/authorization attributes managed by the
        // login provider (SAML/local) - never accept them from the request body
        userServer.startSemester = user.startSemester;
        userServer.duration = user.duration;
        userServer.maxEcts = user.maxEcts;
        userServer.sps = user.sps;
        userServer.fulltime = user.fulltime;
        userServer.completedModules = user.completedModules;
        userServer.dashboardSettings = user.dashboardSettings;
        userServer.timetableSettings = user.timetableSettings;
        userServer.studyPlanSettings = user.studyPlanSettings;
        userServer.favouriteModulesAcronyms = user.favouriteModulesAcronyms;
        userServer.excludedModulesAcronyms = user.excludedModulesAcronyms;
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
  next: NextFunction,
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
    /\d{4}((w)|(s))/g,
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
    ects !== undefined &&
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
  next: NextFunction,
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
        moduleObjectId,
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
              moduleObjectId.toString() === existingMod._id.toString(),
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
      new BadRequestError("Studienverlauf konnte nicht aktualisiert werden"),
    );
  }
}

// semester transition, adding modules of one semester to study path
export async function finishSemester(
  req: Request,
  res: Response,
  next: NextFunction,
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
        moduleObjectId,
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
          existingMod.status === "passed",
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
        moduleObjectId,
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
              moduleObjectId.toString() === existingMod._id.toString(),
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
        "Semester konnte nicht zum Studienverlauf hinzugefügt werden.",
      ),
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
  next: NextFunction,
) {
  const user = req.user as UserServer;
  const aims = req.body.aims;

  if (user._id && aims) {
    try {
      const update = await User.updateOne(
        { _id: user._id },
        { compAims: aims },
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
        "Die eingegebenen Daten sind unvollständig oder ungültig.",
      ),
    );
  }
}

export async function deleteModuleFromStudyPath(
  req: Request,
  res: Response,
  next: NextFunction,
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
        if (index >= 0) {
          user.completedModules.splice(index, 1);
          const result = await user.save();
          const userClient = await transformUserStudyPath(result);
          res.status(200).json(userClient.studyPath);
        } else {
          next(
            new NotFoundError(
              "Das angefragte Modul existiert nicht mehr im Studienverlauf.",
            ),
          );
        }
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
  next: NextFunction,
) {
  const user = req.user as UserServer;
  const onlyFlexNowImported =
    Boolean(req.body.onlyFlexNowImported) ?? undefined;
  try {
    if (user.completedModules) {
      let completedModules: PathModule[] = [];
      if (onlyFlexNowImported) {
        completedModules = user.completedModules.filter(
          (mod) => !mod.flexNowImported,
        );
      }
      const result = await User.updateOne(
        { _id: user._id },
        {
          $set: {
            completedModules: completedModules,
          },
        },
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
  next: NextFunction,
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
        },
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
  next: NextFunction,
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
        },
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
  next: NextFunction,
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
        },
      );
      res.status(200).json(result);
    } else {
      next(new BadRequestError("Die eingegebenen Daten sind nicht valide."));
    }
  } catch (error) {
    next(
      new BadRequestError(
        "Beim Löschen des Moduls ist ein Fehler aufgetreten.",
      ),
    );
  }
}

export async function updateDashboardView(
  req: Request,
  res: Response,
  next: NextFunction,
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

export async function updateStudyPlanSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userReq = req.user as UserServer;
  const settings =
    typeof req.body.settings == "object" &&
    Object.keys(req.body.settings).includes("displayGrades") &&
    Object.keys(req.body.settings).includes("displayProgressBar")
      ? (req.body.settings as StudyPlanSettings)
      : undefined;

  if (settings) {
    try {
      const user = await User.findById(userReq._id);
      if (user) {
        user.studyPlanSettings = settings;
        const result = await user.save();

        res.status(200).send(result.studyPlanSettings);
      } else {
        next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
      }
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new BadRequestError());
  }
}

// TODO: currently just updates current setting, extend if needed
export async function updateTimetableSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userReq = req.user as UserServer;
  const timetableId = validator.matches(
    req.body.timetableId,
    /(dashboard)|(semesterplan)/g,
  )
    ? req.body.timetableId
    : undefined;
  const showWeekends =
    req.body.showWeekends !== undefined
      ? Boolean(req.body.showWeekends)
      : undefined;
  const selectedView =
    req.body.selectedView && validator.isAlpha(req.body.selectedView)
      ? req.body.selectedView
      : undefined;

  try {
    const user = await User.findById(userReq._id);
    if (user && timetableId) {
      let setting = user.timetableSettings.find(
        (el) => el.timetableId == timetableId,
      );

      if (setting) {
        setting.showWeekends =
          showWeekends !== undefined ? showWeekends : setting.showWeekends;
        setting.selectedView = selectedView ?? setting.selectedView;
      } else {
        // add showWeekends setting if it does not exist
        user.timetableSettings.push({
          timetableId,
          showWeekends: showWeekends !== undefined ? showWeekends : true,
          selectedView,
        });
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
  next: NextFunction,
) {
  const userReq = req.user as UserServer;
  const acronym =
    typeof req.body.acronym == "string" ? req.body.acronym : undefined;

  if (userReq._id && acronym) {
    try {
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
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
  }
}

export async function updateExcludedModule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user as UserServer;
  const acronym =
    typeof req.body.acronym == "string" ? req.body.acronym : undefined;

  if (user._id && acronym) {
    try {
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
    } catch (error) {
      next(new BadRequestError());
    }
  } else {
    next(new NotFoundError("Zu den Daten wurde kein Eintrag gefunden."));
  }
}

export async function toggleTopic(
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
) {
  const userReq = req.user as UserServer;
  const key = typeof req.body.key == "string" ? req.body.key : undefined;
  const hasConfirmed =
    req.body.hasConfirmed !== undefined
      ? Boolean(req.body.hasConfirmed)
      : undefined;

  if (userReq._id && key && hasConfirmed !== undefined) {
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
  next: NextFunction,
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
  next: NextFunction,
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
      (mf: ModuleFeedback) => mf.acronym === feedback.acronym,
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
  next: NextFunction,
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
      (mf: ModuleFeedback) => mf.acronym !== feedback.acronym,
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
  next: NextFunction,
) {
  const user = req.user as UserServer;
  const jobId = validateObjectId(req.body.id) ? req.body.id : undefined;

  if (jobId) {
    try {
      // delete job from user
      await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { jobs: { _id: jobId } } },
      );
      // delete job from recommendation
      const recommendation = await Recommendation.findOne({ userId: user._id });
      if (recommendation && recommendation.recommendedMods) {
        recommendation.recommendedMods.forEach((mod) => {
          mod.source = mod.source.filter(
            (source) => source.identifier !== jobId,
          );
        });
        recommendation.recommendedMods = recommendation.recommendedMods.filter(
          (mod) => mod.source.length > 0,
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
  next: NextFunction,
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
        });
        const deletedRecommendations = await Recommendation.deleteMany({
          userId: user._id,
        });
        const deletedUser = await User.findByIdAndDelete(user._id);
        if (
          deletedStudyPlans &&
          deletedUser &&
          deletedSemesterPlans &&
          deletedRecommendations
        ) {
          res.status(200).json("Der Nutzer wurde gelöscht!");
        } else {
          next(
            new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."),
          );
        }
      } catch (error) {
        next(
          new BadRequestError("Es ist ein unerwarteter Fehler aufgetreten."),
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
      studyPlanSettings: user.studyPlanSettings,
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
  jobs: Job[] | undefined,
): Promise<ExtendedJob[]> {
  if (jobs) {
    const recModules = await Recommendation.findOne({ userId });
    const transformedJobs: ExtendedJob[] = [];
    if (recModules) {
      for (const job of jobs) {
        const jobModules = recModules.recommendedMods?.filter((mod) => {
          return mod.source.find(
            (source) => source.identifier === job._id.toString(),
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
  next: NextFunction,
) {
  try {
    const baId = decrypt((req.session as any).passport.user.baId);
    const url = process.env.FN_STUDENT_URL
      ? process.env.FN_STUDENT_URL + baId
      : "";
    const importStudypath = req.body.importStudypath;
    const studyprogrammes = await prisma.studyProgramme.findMany({
      select: {
        spId: true,
        poVersion: true,
      },
    });
    const user = req.user as UserServer;
    if (url) {
      let result;
      if (user && user.roles.includes("admin")) {
        // read test xml file if user is admin
        result = fs.readFileSync(
          __dirname + "../../../../../staticdata/dummy_student_bachelor.xml",
          "utf8",
        );
      } else {
        // crawl results from flexnow api
        result = await new Promise<string>((resolve, reject) => {
          const data = new URLSearchParams();
          data.append(
            "login",
            process.env.FN_LOGIN ? process.env.FN_LOGIN : "",
          );
          data.append("password", process.env.FN_PW ? process.env.FN_PW : "");

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
                Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "utf-8"),
              );
            });
            res.on("end", () => {
              if (res.statusCode === 200) {
                const buffer = Buffer.concat(chunks);
                const ansiString = buffer.toString("utf-8");
                resolve(ansiString);
              } else {
                reject(
                  new Error(
                    `Request failed with status code ${res.statusCode}`,
                  ),
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
      }

      const metadata: any[] = await transform(result, metaDataTemplate);
      const studypath: any = importStudypath
        ? await transform(result, studyPathTemplate)
        : undefined;

      const userData: FnMetaData = extractMetadata(metadata, studyprogrammes);

      if (studypath) {
        let modules: Module[] = [];
        let mgs: { mgId: string; version: Number }[] = [];
        for (let sp of userData.sps) {
          const mhbId = String(sp.mhbId);
          const mhbVersion = sp.mhbVersion;
          const mhb = await findAndBuildModuleHandbookByIdAndVersion(
            mhbId,
            mhbVersion,
          );
          if (mhb) {
            modules = modules.concat(
              await iterateOverMgsAndReturnModules(mhb.mgs),
            );
            mgs = mgs.concat(await iterateOverMgsAndReturnMgs(mhb.mgs));
          }
        }

        if (studypath.completedModules) {
          let modulesWithoutAcronymCount = 1;
          for (let module of studypath.completedModules) {
            if (!module.acronym) {
              if (module.examAttempts && module.examAttempts.length > 0) {
                module.acronym = `${module.examAttempts[0].remark}-${modulesWithoutAcronymCount}`;
              } else {
                module.acronym = `Sonstige Leistung ${modulesWithoutAcronymCount}`;
              }
              modulesWithoutAcronymCount++;
            }

            // check if semester is set, otherwise set it to semesterEnd or as last fallback to current semester
            if (!module.semester) {
              module.semester = module.semesterEnd ?? new Semester().apNr;
            }

            // find module in modules and take this mgId - information of xml is not sufficient enough since modulegroup list is incomplete
            if (modules) {
              module.moduleGroups = modules
                .filter((el) => el.mId == module.mId)
                .map((mod) => {
                  const mg = mgs.find((mg) => mg.mgId === mod.mgId);
                  if (mg) {
                    return {
                      mgId: mg.mgId,
                      version: mg.version,
                    };
                  } else {
                    return {
                      mgId: mod.mgId,
                      version: "0",
                    };
                  }
                });
              // if no moduleGroup is found here, another case could be that module is not in mhb anymore
              if (module.moduleGroups.length == 0) {
                const oldModule = await prisma.module.findFirst({
                  where: {
                    mId: module.mId,
                    version: Number(module.version),
                  },
                  include: {
                    mgs: true,
                  },
                });
                module.moduleGroups = oldModule
                  ? oldModule.mgs
                      .filter((item) => mgs.find((mg) => mg.mgId == item.mgId))
                      .map((item) => {
                        return {
                          mgId: item.mgId,
                          version: String(item.mgVersion),
                        };
                      })
                  : [];
              }
            }
          }
        }
      }

      res.json({
        metadata: userData,
        studypath,
        raw: {
          metadata,
          studypath,
        },
        xml: result,
      });
    } else {
      res.status(404).json({
        message: "Es konnten keine Daten von FlexNow geladen werden.",
      });
    }
  } catch (error) {
    next(error);
  }

  function extractMetadata(
    fnStudyprogrammes: FnStudyProgramme[],
    studyprogrammes: { spId: string; poVersion: number }[],
  ): FnMetaData {
    let metadata: FnMetaData = {
      sps: [],
    };

    // filter only studyprogrammes that are available in Baula
    fnStudyprogrammes = fnStudyprogrammes.filter(
      (el) =>
        studyprogrammes.findIndex(
          (sp) => sp.spId == el.spId && sp.poVersion == el.poVersion,
        ) > -1,
    );

    for (let fnStudyprogramme of fnStudyprogrammes) {
      const currentSemester = fnStudyprogramme.semesters.find(
        (sem) => sem.semester == new Semester().apNr,
      );
      const startSemester = fnStudyprogramme.semesters.find(
        (sem) => sem.startSemester,
      );
      metadata.sps.push({
        spId: fnStudyprogramme.spId,
        poVersion: fnStudyprogramme.poVersion,
        name: fnStudyprogramme.name,
        faculty: fnStudyprogramme.faculty,
        mhbId: fnStudyprogramme.mhbId,
        mhbVersion: fnStudyprogramme.mhbVersion,
        status: fnStudyprogramme.status,
        duration:
          fnStudyprogramme.duration > fnStudyprogramme.semesters.length
            ? fnStudyprogramme.duration
            : fnStudyprogramme.semesters.length,
        maxEcts: fnStudyprogramme.maxEcts,
        startSemester: startSemester
          ? new Semester(startSemester.semester).name
          : new Semester().name,
      });

      // set status
      metadata.fulltime = currentSemester ? !currentSemester.partTime : true;
    }
    // TODO for future releases take into account multiple studyprogrammes
    // set startSemester
    //metadata.startSemester = identifyEarliestSemester(metadata.sps.map(el => el.startSemester ?? ''))
    // set duration
    //metadata.duration = calculateDuration(fnStudyprogrammes);
    // set maxEcts
    //metadata.maxEcts = metadata.sps.reduce((pv, cv) => cv.maxEcts ? pv + cv.maxEcts : pv + 0, 0)

    // TODO currently select first current studyprogram and set default values
    const currentSp = metadata.sps.find((el) => el.status == "Immatrikuliert");
    metadata.startSemester =
      (currentSp && currentSp.startSemester) ?? new Semester().name;
    metadata.duration = (currentSp && currentSp.duration) ?? 6;
    metadata.maxEcts = (currentSp && currentSp.maxEcts) ?? 180;

    return metadata;
  }

  // Helper functions for preselection of values
  /**
   * Takes the extracted programs and calculates the duration
   * For current programs takes the maximum duration, assumption that if student
   * has more sps the highest duration is taking into account
   * For past programs the unique semesters were identified and counted
   * @param sps
   * @returns
   */
  function calculateDuration(sps: FnStudyProgramme[]): number {
    let currentSps = sps.filter((sp) => sp.status == "Immatrikuliert");
    let pastSps = sps.filter((sp) => sp.status == "Exmatrikuliert");
    let highestDurationOfCurrentSps = Math.max(
      ...currentSps.map((el) => el.duration ?? 0),
    );
    let semester: string[] = [];
    for (let sp of pastSps) {
      semester = semester.concat(sp.semesters.map((el) => el.semester));
    }
    semester = [...new Set([...semester])];

    return highestDurationOfCurrentSps + semester.length;
  }

  /**
   * Takes a list of semesters and identifies the earliest semester
   * @param list of strings containing empty values or semester names in univis style (2026s)
   */
  function identifyEarliestSemester(list: string[]): string {
    let earliestSemester = new Semester();
    let semesters = list.map((el) => new Semester(el));

    for (let semester of semesters) {
      if (earliestSemester.year > semester.year) {
        earliestSemester = semester;
      } else if (
        earliestSemester.year == semester.year &&
        earliestSemester.type == "w" &&
        semester.type == "s"
      ) {
        earliestSemester = semester;
      }
    }

    return earliestSemester.name;
  }
}
