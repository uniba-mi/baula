import {
  Department,
  Prisma,
  PrismaClient,
  StudyProgramme,
} from "@prisma/client";
import { logError } from "../error";
import { Person } from "../../../../../interfaces/person";
import { ModuleHandbook } from "../../../../../interfaces/module-handbook";

const prisma = new PrismaClient();

export async function upsertDeparmtents(
  departments: Department[]
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const depChange = { added: 0, updated: 0 };
    try {
      // reduce departments to unique values
      departments = departments.filter(
        (department, index, self) =>
          index === self.findIndex((d) => d.shortName === department.shortName)
      );
      // add departments to database otherwise check for update
      for (let department of departments) {
        const existingDep = await prisma.department.findFirst({
          where: {
            shortName: department.shortName,
          },
        });
        if (!existingDep) {
          await prisma.department.create({
            data: department,
          });
          depChange.added++;
        } else {
          // check for changes and update
          if (existingDep.name !== department.name) {
            await prisma.department.update({
              where: {
                shortName: department.shortName,
              },
              data: {
                name: department.name,
              },
            });
            depChange.updated++;
          }
        }
      }
      resolve(
        `Departments: ${departments.length} queried - ${depChange.added} added - ${depChange.updated} updated`
      );
    } catch (error) {
      logError(error);
      resolve("ERROR - Fehler beim Hinzufügen der Departments");
    }
  });
}

export async function upsertPersons(persons: Person[]): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const personsChange = { added: 0, updated: 0 };
    try {
      persons = persons.filter(
        (person, index, self) =>
          index === self.findIndex((d) => d.pId === person.pId)
      );
      for (let person of persons) {
        const existingPerson = await prisma.person.findUnique({
          where: {
            pId: person.pId,
          },
        });
        if (!existingPerson) {
          await prisma.person.create({
            data: person,
          });
          personsChange.added++;
        } else {
          // check for changes and update
          if (
            existingPerson.firstname !== person.firstname ||
            existingPerson.lastname !== person.lastname ||
            existingPerson.title !== person.title ||
            existingPerson.email !== person.email
          ) {
            await prisma.person.update({
              where: {
                pId: person.pId,
              },
              data: person,
            });
            personsChange.updated++;
          }
        }
      }
      resolve(
        `Persons: ${persons.length} queried - ${personsChange.added} added - ${personsChange.updated} updated`
      );
    } catch (error) {
      logError(error);
      resolve("ERROR - Fehler beim Hinzufügen der Personen");
    }
  });
}

export async function upsertStudyprogrammes(
  sps: StudyProgramme[]
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const spsChanges = { added: 0, updated: 0 };
    try {
      sps = sps.filter(
        (programme, index, self) =>
          index ===
          self.findIndex(
            (d) =>
              d.spId === programme.spId && d.poVersion === programme.poVersion
          )
      );
      for (let programme of sps) {
        const existingSp = await prisma.studyProgramme.findUnique({
          where: {
            spId_poVersion: {
              spId: programme.spId,
              poVersion: programme.poVersion,
            },
          },
        });
        if (!existingSp) {
          await prisma.studyProgramme.create({
            data: programme,
          });
          spsChanges.added++;
        } else {
          // check for changes and update
          if (
            existingSp.desc !== programme.desc ||
            existingSp.name !== programme.name ||
            existingSp.date !== programme.date ||
            existingSp.faculty !== programme.faculty
          ) {
            await prisma.studyProgramme.update({
              where: {
                spId_poVersion: {
                  spId: programme.spId,
                  poVersion: programme.poVersion,
                },
              },
              data: programme,
            });
            spsChanges.updated++;
          }
        }
      }
      resolve(
        `Study Programmes: ${sps.length} queried - ${spsChanges.added} added - ${spsChanges.updated} updated`
      );
    } catch (error) {
      logError(error);
      resolve("ERROR - Fehler beim Hinzufügen der Studiengänge");
    }
  });
}

export async function upsertModuleHandbooks(
  mhbs: ModuleHandbook[]
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const mhbsChanges = { added: 0, updated: 0 };
    try {
      mhbs = mhbs.filter(
        (mhb, index, self) =>
          index ===
          self.findIndex(
            (d) => d.mhbId === mhb.mhbId && d.version === mhb.version
          )
      );
      for (let mhb of mhbs) {
        const existingMhb = await prisma.mhb.findUnique({
          where: {
            mhbId_version: {
              mhbId: mhb.mhbId,
              version: mhb.version,
            },
          },
        });
        if (!existingMhb) {
          await prisma.mhb.create({
            data: {
              mhbId: mhb.mhbId,
              version: mhb.version,
              name: mhb.name,
              desc: mhb.desc,
              semester: mhb.semester,
            },
          });
          mhbsChanges.added++;
        } else {
          // check for changes and update
          if (
            existingMhb.name !== mhb.name ||
            existingMhb.desc !== mhb.desc ||
            existingMhb.semester !== mhb.semester
          ) {
            await prisma.mhb.update({
              where: {
                mhbId_version: {
                  mhbId: mhb.mhbId,
                  version: mhb.version,
                },
              },
              data: {
                name: mhb.name,
                desc: mhb.desc,
                semester: mhb.semester,
              },
            });
            mhbsChanges.updated++;
          }
        }
      }
      resolve(
        `Module Handbooks: ${mhbs.length} queried - ${mhbsChanges.added} added - ${mhbsChanges.updated} updated`
      );
    } catch (error) {
      logError(error);
      resolve("ERROR - Fehler beim Hinzufügen der Modulhandbücher");
    }
  });
}

export async function upsertModuleGroups(
  mgs: Prisma.ModuleGroupCreateInput[]
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const mgsChange = { added: 0, updated: 0 };
    try {
      mgs = mgs.filter(
        (mg, index, self) =>
          index ===
          self.findIndex((d) => d.mgId === mg.mgId && d.version === mg.version)
      );
      for (let mg of mgs) {
        // filter invalid values in mgs
        if (Number.isNaN(mg.ectsMin)) {
          mg.ectsMin = null;
        }
        if (Number.isNaN(mg.ectsMax)) {
          mg.ectsMax = null;
        }
        if (Number.isNaN(mg.order)) {
          mg.order = null;
        }
        // add modulegroups to database otherwise check for update
        const existingMg = await prisma.moduleGroup.findUnique({
          where: {
            mgId_version: {
              mgId: mg.mgId,
              version: mg.version,
            },
          },
        });
        if (!existingMg) {
          await prisma.moduleGroup.create({
            data: mg,
          });
          mgsChange.added++;
        } else {
          // check for changes and update
          if (
            existingMg.name !== mg.name ||
            existingMg.desc !== mg.desc ||
            existingMg.fullName !== mg.fullName ||
            existingMg.ectsMin !== mg.ectsMin ||
            existingMg.ectsMax !== mg.ectsMax ||
            existingMg.order !== mg.order
          ) {
            await prisma.moduleGroup.update({
              where: {
                mgId_version: {
                  mgId: mg.mgId,
                  version: mg.version,
                },
              },
              data: mg,
            });
            mgsChange.updated++;
          }
        }
      }
      resolve(
        `Module Groups: ${mgs.length} queried - ${mgsChange.added} added - ${mgsChange.updated} updated`
      );
    } catch (error) {
      logError(error);
      resolve("ERROR - Fehler beim Hinzufügen der Modulgruppen");
    }
  });
}

export async function upsertModules(
  modules: any[]
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const modulesChange = { added: 0, updated: 0 };
    try {
      modules = modules.filter(
        (module, index, self) =>
          index ===
          self.findIndex(
            (d) => d.mId === module.mId && d.version === module.version
          )
      );
      for (let module of modules) {
        // convert workload from array to string
        if(module.workload) {
          let workloadString = "";
          for (let string of module.workload) {
            if (string.type && string.hours) {
              workloadString += `${string.type}: ${string.hours} Stunden\n`;
            } else {
              workloadString += `${string.hours} Stunden\n`;
            }
          }
          module.workload = workloadString;
        } else {
          module.workload = null;
        }
        // add modules to database otherwise check for update
        const existingModule = await prisma.module.findUnique({
          where: {
            mId_version: {
              mId: module.mId,
              version: module.version,
            },
          },
        });
        if (!existingModule) {
          await prisma.module.create({
            data: module,
          });
          modulesChange.added++;
        } else {
          // check for changes and update
          if (
            existingModule.name !== module.name ||
            existingModule.content !== module.content ||
            existingModule.skills !== module.skills ||
            existingModule.addInfo !== module.addInfo ||
            existingModule.priorKnowledge !== module.priorKnowledge ||
            existingModule.ects !== module.ects ||
            existingModule.term !== module.term ||
            existingModule.recTerm !== module.recTerm ||
            existingModule.duration !== module.duration ||
            existingModule.chair !== module.chair ||
            existingModule.offerBegin !== module.offerBegin ||
            existingModule.offerEnd !== module.offerEnd ||
            existingModule.workload !== module.workload
          ) {
            await prisma.module.update({
              where: {
                mId_version: {
                  mId: module.mId,
                  version: module.version,
                },
              },
              data: module,
            });
            modulesChange.updated++;
          }
        }
      }
      resolve(
        `Modules: ${modules.length} queried - ${modulesChange.added} added - ${modulesChange.updated} updated`
      );
    } catch (error) {
      logError(error);
      resolve("ERROR - Fehler beim Hinzufügen der Module");
    }
  });
}

export async function upsertModuleExams(
  exams: Prisma.ModuleExamCreateInput[]
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const examsChange = { added: 0, updated: 0 };
    try {
      exams = exams.filter(
        (exam, index, self) =>
          index === self.findIndex((d) => d.meId === exam.meId)
      );
      for (let exam of exams) {
        if (Number.isNaN(exam.duration)) {
          exam.duration = null;
        }
        // add exams to database otherwise check for update
        const existingExam = await prisma.moduleExam.findUnique({
          where: {
            meId: exam.meId,
          },
        });
        if (!existingExam) {
          await prisma.moduleExam.create({
            data: exam,
          });
          examsChange.added++;
        } else {
          // check for changes and update
          if (
            existingExam.shortName !== exam.shortName ||
            existingExam.name !== exam.name ||
            existingExam.desc !== exam.desc ||
            existingExam.duration !== exam.duration ||
            existingExam.share !== exam.share
          ) {
            await prisma.moduleExam.update({
              where: {
                meId: exam.meId,
              },
              data: exam,
            });
            examsChange.updated++;
          }
        }
      }
      resolve(
        `Module Exams: ${exams.length} queried - ${examsChange.added} added - ${examsChange.updated} updated`
      );
    } catch (error) {
      logError(error);
      resolve("ERROR - Fehler beim Hinzufügen der Prüfungen");
    }
  });
}

export async function upsertModuleCourses(
  mcs: Prisma.ModuleCourseCreateInput[]
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const mcsChange = { added: 0, updated: 0 };
    try {
      mcs = mcs.filter(
        (mc, index, self) => index === self.findIndex((d) => d.mcId === mc.mcId)
      );
      for (let mc of mcs) {
        // filter invalid values in mcs
        if (Number.isNaN(mc.order)) {
          mc.order = null;
        }
        if (Number.isNaN(mc.ects)) {
          mc.ects = null;
        }
        if (Number.isNaN(mc.sws)) {
          mc.sws = null;
        }
        // add moduleCourses to database otherwise check for update
        const existingMc = await prisma.moduleCourse.findUnique({
          where: {
            mcId: mc.mcId,
          },
        });
        if (!existingMc) {
          await prisma.moduleCourse.create({
            data: mc,
          });
          mcsChange.added++;
        } else {
          // check for changes and update
          if (
            existingMc.name !== mc.name ||
            existingMc.type !== mc.type ||
            existingMc.language !== mc.language ||
            existingMc.desc !== mc.desc ||
            existingMc.ects !== mc.ects ||
            existingMc.term !== mc.term ||
            existingMc.order !== mc.order ||
            existingMc.compulsory !== mc.compulsory ||
            existingMc.literature !== mc.literature ||
            existingMc.sws !== mc.sws
          ) {
            await prisma.moduleCourse.update({
              where: {
                mcId: mc.mcId,
              },
              data: mc,
            });
            mcsChange.updated++;
          }
        }
      }
      resolve(
        `Module Courses: ${mcs.length} queried - ${mcsChange.added} added - ${mcsChange.updated} updated`
      );
    } catch (error) {
      logError(error);
      resolve("ERROR - Fehler beim Hinzufügen der Lehrveranstaltungen");
    }
  });
}
