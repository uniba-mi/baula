import { PathModule } from '@interfaces/study-path';
import { mergeFlexNowAttempts } from './exam-attempt.helper';

export interface FlexNowMergeResult {
  merged: PathModule[];
  addedCount: number;
  updatedCount: number;
}

/**
 * Merges freshly fetched FlexNow modules of a single semester into an existing set of
 * PathModules. Used by the finish-semester-stepper's "Mit FlexNow abgleichen" step and by
 * FlexnowService.extractCompletedModules. Matches by ID first, then acronym + semester -
 * two modules for the same exam with entirely different acronyms stay separate, there is
 * no other shared key.
 */
export function mergeFlexNowModulesIntoMissingModules(
  missingModules: PathModule[],
  flexNowModules: PathModule[],
  mhbAcronyms: Set<string>,
): FlexNowMergeResult {
  const merged = [...missingModules];
  let addedCount = 0;
  let updatedCount = 0;

  for (const fnModule of flexNowModules) {
    const matchIndex = merged.findIndex((existing) =>
      matchesModule(existing, fnModule, mhbAcronyms),
    );

    if (matchIndex >= 0) {
      merged[matchIndex] = {
        ...merged[matchIndex],
        status: fnModule.status,
        grade: fnModule.grade,
        ects: fnModule.ects ?? merged[matchIndex].ects,
        // imported attempts replace the previously imported ones, manually entered
        // ones are kept - see mergeFlexNowAttempts
        examAttempts: mergeFlexNowAttempts(
          merged[matchIndex].examAttempts,
          fnModule.examAttempts,
        ),
        flexNowImported: true,
      };
      updatedCount++;
    } else {
      // FlexNow only reports official modules, so isUserGenerated is always false and
      // never derived from mhbAcronyms: during the initial import at account creation
      // the MHB is not loaded yet, which would flag every module as user-generated and
      // duplicate it on the next sync.
      merged.push({
        ...fnModule,
        isUserGenerated: false,
        flexNowImported: true,
      });
      addedCount++;
    }
  }

  return { merged, addedCount, updatedCount };
}

function matchesModule(
  existing: PathModule,
  incoming: PathModule,
  mhbAcronyms: Set<string>,
): boolean {
  if (existing._id && incoming._id) {
    return existing._id === incoming._id;
  }

  if (
    existing.acronym === incoming.acronym &&
    existing.semester === incoming.semester
  ) {
    // a known MHB acronym identifies the module on its own, e.g. a manual placeholder
    // typed in with the official acronym
    if (mhbAcronyms.has(existing.acronym)) {
      return true;
    }
    // free-text acronyms can collide, so only match them if both sides come from FlexNow
    if (existing.isUserGenerated || incoming.isUserGenerated) {
      return !!existing.flexNowImported && !!incoming.flexNowImported;
    }
    return true;
  }

  return false;
}
