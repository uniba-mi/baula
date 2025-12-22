import { PrismaClient } from "@prisma/client";
import { moduleChanges } from "../constants/module-mapping";
import { ModuleGroup } from "../../../../../interfaces/module-group";
import { Module } from "../../../../../interfaces/module";
import { ModuleCourse } from "../../../../../interfaces/module-course";
import { ModuleHandbook } from "../../../../../interfaces/module-handbook";

const prisma = new PrismaClient();

export async function extractModules(
  mhbId: string,
  version: number
): Promise<Module[] | undefined> {
  // get mhb information
  const mhb = await findAndBuildModuleHandbookByIdAndVersion(mhbId, version);
  if (mhb) {
    let modules = iterateOverMgsAndReturnModules(mhb.mgs);
    // remove duplicates
    modules = removeDuplicates(modules);

    return modules;
  } else {
    return undefined;
  }
}

export async function findAndBuildModuleHandbookByIdAndVersion(mhbId: string, version: number): Promise<ModuleHandbook | undefined> {
  // initiate result variable
      let mhbStructure = undefined;
  
      // get mhb information
      const mhb = await prisma.mhb.findUnique({
        where: {
          mhbId_version: {
            mhbId,
            version,
          },
        }
      });
  
      // build own structure
      if (mhb) {
        // build initial structure
        mhbStructure = new ModuleHandbook(
          mhb.mhbId,
          mhb.version,
          mhb.name,
          mhb.desc,
          mhb.semester
        );
  
        // find and add modulegroups
        const moduleGroupResult = await prisma.mhb2Mg.findMany({
          select: {
            mg: true,
          },
          where: {
            mhbId: mhbId,
            versionMhb: version,
          },
          orderBy: [
            {
              mg: {
                order: 'asc'
              }
            },
            {
              mg: {
                name: 'asc'
              }
            }
          ]
        });
        let moduleGroups: ModuleGroup[] = [];
        for (let entry of moduleGroupResult) {
          moduleGroups.push(
            new ModuleGroup(
              entry.mg.mgId,
              entry.mg.version,
              entry.mg.name,
              entry.mg.fullName,
              entry.mg.desc,
              entry.mg.ectsMin,
              entry.mg.ectsMax,
              0
            )
          );
        }
        // add modulegroups to structure --> reference on classes in mhb_structure.js
        mhbStructure.addModuleGroups(moduleGroups);
  
        // start recursive building of structure
        await buildStructure(mhbStructure.mgs);
  
        return mhbStructure;
      } else {
        return undefined;
      }
};

/**--------------------------------------------------------------
 * Helper function to implement recursion in structure generation, recursion is needed since it is flexibel how deep the structure is
 * @param moduleGroups an array of ModuleGroups -> typedefinition in mhb_structure.js
 * needs to be async so that the process in the get-Request is waiting for the structure to be build
   --------------------------------------------------------------*/
   async function buildStructure(moduleGroups: ModuleGroup[]) {
    // iterate over modulegroups
    for (let mg of moduleGroups) {
      // find children
      const childrenResult = await prisma.mg2Mg.findMany({
        select: {
          child: true,
        },
        where: {
          parentId: mg.mgId.toString(),
          parentVersion: mg.version.valueOf(),
        },
        orderBy: {
          child: {
            order: "asc",
          },
        },
      });
  
      // find modules
      const modulesResult = await prisma.mod2Mg.findMany({
        select: {
          mod: {
            select: {
              mId: true,
              version: true,
              acronym: true,
              name: true,
              content: true,
              skills: true,
              addInfo: true,
              priorKnowledge: true,
              ects: true,
              term: true,
              recTerm: true,
              duration: true,
              chair: true,
              respPerson: true,
              prevModules: true,
              exams: true,
              offerBegin: true,
              offerEnd: true,
              workload: true,
            },
          },
        },
        where: {
          mgId: mg.mgId.toString(),
          mgVersion: mg.version.valueOf(),
        },
      });
  
      // check if children exist
      if (childrenResult.length !== 0) {
        // transform childrenResult to children
        let children: ModuleGroup[] = [];
        for (const entry of childrenResult) {
          children.push(
            new ModuleGroup(
              entry.child.mgId,
              entry.child.version,
              entry.child.name,
              entry.child.fullName,
              entry.child.desc,
              entry.child.ectsMin,
              entry.child.ectsMax,
              0,
              { mgId: mg.mgId, root: mg.parent ? false : true}
            )
          );
        }
        // add children to structure
        mg.addChildren(children);
  
        // if children exist do same steps again until a modulegroup do not have children (meaning no other modulegroups)
        if (mg.children) {
          await buildStructure(mg.children);
        }
      }
  
      // check if modules exist
      if (modulesResult.length !== 0) {
        // transform moduleResult to modules
        let modules: Module[] = [];
        for (const entry of modulesResult) {
          entry.mod.exams;
          modules.push(
            new Module(
              entry.mod.mId,
              entry.mod.version,
              entry.mod.acronym,
              entry.mod.name,
              entry.mod.content,
              entry.mod.skills,
              entry.mod.addInfo,
              entry.mod.priorKnowledge,
              entry.mod.ects,
              entry.mod.term,
              entry.mod.recTerm,
              entry.mod.duration,
              entry.mod.chair,
              entry.mod.respPerson,
              entry.mod.exams,
              entry.mod.prevModules,
              entry.mod.offerBegin,
              entry.mod.offerEnd,
              entry.mod.workload
            )
          );
        }
  
        if (mg && modules) {
          await addParentMgId(mg, modules);
        }
  
        // add modules to structure
        mg.addModules(modules);
        if (mg.modules) {
          await addModuleCourses(mg.modules);
        }
  
        // add acronyms of previous modules extracted from priorKnowledge (Vorkenntnisse) to structure
        // NOTICE: this would not be necessary if the prevModules field (SortedAlleVormodule) would be filled by instructors instead of the priorKnowledge field
        if (mg.modules) {
          await addExtractedModules(mg.modules);
        }
  
        // adds all unique acronyms of modules from prevModules and extractedPreviousModules to the structure
        // NOTICE: this would not be necessary if the prevModules field (SortedAlleVormodule) would be filled by instructors instead of the priorKnowledge field
        if (mg.modules) {
          await addAllPriorModules(mg.modules);
        }
  
        if (mg && mg.modules) {
          await addCompulsoryInfo(mg, mg.modules);
        }
      }
    }
  }
  
  /**------------------------------------------------------------
   * Helper function to add courses to modules, used in the function buildStructure
   * @param modules contains the modules to which the courses should be found and added
   -------------------------------------------------------------- */
  export async function addModuleCourses(modules: Module[]) {
    for (let mod of modules) {
      // find modulecourses
      const coursesResult = await prisma.mod2ModCourse.findMany({
        select: {
          mCourse: {
            select: {
              mcId: true,
              name: true,
              identifier: true,
              type: true,
              language: true,
              term: true,
              order: true,
              compulsory: true,
              desc: true,
              literature: true,
              ects: true,
              sws: true,
              lecturers: {
                select: {
                  person: true,
                },
              },
            },
          },
        },
        where: {
          mId: mod.mId.toString(),
          mVersion: mod.version.valueOf(),
        },
      });
      let courses: ModuleCourse[] = [];
      for (const entry of coursesResult) {
        entry.mCourse.lecturers;
        courses.push(
          new ModuleCourse(
            entry.mCourse.mcId,
            entry.mCourse.name,
            entry.mCourse.lecturers,
            entry.mCourse.type,
            entry.mCourse.language,
            entry.mCourse.term,
            entry.mCourse.compulsory,
            entry.mCourse.desc,
            entry.mCourse.literature,
            entry.mCourse.ects,
            entry.mCourse.sws,
            mod.mId,
            mod.acronym,
            entry.mCourse.order
          )
        );
      }
      // add modulecourses to module
      mod.addCourses(courses);
    }
  }
  
  /**------------------------------------------------------------
   * Helper function to add module acronyms extracted from priorKnowledge to modules, used in the function buildStructure
   * @param modules contains the modules to which the acronyms should be found and added
   -------------------------------------------------------------- */
  export async function addExtractedModules(modules: Module[]) {
    let matches = null;
  
    // regex for the search for module acronyms
    const regex = /([A-Za-z]+)-([A-Za-z|\d]+)-([A-Za-z]|B|M|\d*)*/g;
  
    for (let mod of modules) {
      if (mod.priorKnowledge) {
        matches = mod.priorKnowledge.match(regex);
  
        let uniqueAcronyms = [...new Set(matches)];
    
        mod.addExtractedPrevModules(uniqueAcronyms);
      }
    }
  }
  
  /**------------------------------------------------------------
   * Helper function to find all unique module acronyms from prevModules and prevModules acronyms, used in the function buildStructure
   * @param modules contains the modules to which the acronyms should be found and added
   -------------------------------------------------------------- */
  export async function addAllPriorModules(modules: Module[]) {
    for (let mod of modules) {
  
      // collect acronym string of each prevModule
      let prevModulesValues: string[] = [];
  
      for (let prevMod of mod.prevModules) {
        if (prevMod.acronym) {
          prevModulesValues.push(prevMod.acronym);
        }
      }
  
      // save extractedPreviousModules values
      let extractedPreviousModulesValues: string[] = mod.extractedPrevModules;
  
      let uniqueAcronyms: string[] = [
        ...new Set([...prevModulesValues, ...extractedPreviousModulesValues]),
      ];
  
      // map old acronyms to new acronyms
      uniqueAcronyms = uniqueAcronyms.map((acronym) => {
        const mapping = moduleChanges.find((change) => change.oldModuleAcronym === acronym);
        return mapping ? mapping.newModuleAcronym : acronym;
      });
  
      // exclude the current module's acronym
      uniqueAcronyms = uniqueAcronyms.filter(acronym => acronym !== mod.acronym);
  
      let acronyms = [...new Set(uniqueAcronyms)];
      mod.addAllPriorModules(acronyms);
    }
  }
  
  /**------------------------------------------------------------
   * Helper function to mark module as compulsory if mg's ectsmin is equal to mg's modules sum
   * @param mg contains the module group with ectsmin
  * @param modules contains the modules and their ects for the comparison
   -------------------------------------------------------------- */
  function addCompulsoryInfo(mg: ModuleGroup, modules: Module[]) {
    if (mg && modules) {
      // sum up ects of modules in mg
      const ectsSum = modules.reduce((acc, module) => {
        return acc + module.ects;
      }, 0);
  
      for (let mod of modules) {
        // modules are compulsory if the minimum number of the mg ects is equal to the modules ects sum
        if (ectsSum === mg.ectsMin) {
          mod.addTypeInfo('Pflichtmodul');
        } else {
          mod.addTypeInfo('Wahlmodul')
        }
      }
    }
  }
  
  /**------------------------------------------------------------
   * Helper function to append parent's mgId to each module
   * @param mg contains the module group with mgId
  * @param modules contains the modules of the mg
   -------------------------------------------------------------- */
  function addParentMgId(mg: ModuleGroup, modules: Module[]) {
    if (mg && modules) {
      for (let mod of modules) {
        mod.mgId = String(mg.mgId);
      }
    }
  }

// Helper function to get modules out of mhb
export function iterateOverMgsAndReturnModules(mgs: ModuleGroup[]): Module[] {
    let modules: Module[] = [];
    //iterate over modulegroups
    for (let mg of mgs) {
      // add modules to list
      if (mg.modules) {
        modules = modules.concat(mg.modules);
      }
      if (mg.children) {
        let childModules = iterateOverMgsAndReturnModules(mg.children);
        modules = modules.concat(childModules);
      }
    }
    return modules;
  }
  
  // code inspiried by https://stackoverflow.com/questions/36032179/remove-duplicates-in-an-object-array-javascript
export function removeDuplicates(arr: Module[]): Module[] {
    return arr.reduce(
      function (p: { temp: string[]; out: Module[] }, c) {
        // create an identifying id from the object values
        var id = [c.mId, c.version].join('|');
  
        // if the id is not found in the temp array
        // add the object to the output array
        // and add the key to the temp array
        if (p.temp.indexOf(id) === -1) {
          p.out.push(c);
          p.temp.push(id);
        }
        return p;
  
        // return the deduped array
      },
      {
        temp: [],
        out: [],
      }
    ).out;
  }