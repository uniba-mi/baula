import { PathModule } from '@interfaces/study-path';

export interface FlexNowMergeResult {
  merged: PathModule[];
  addedCount: number;
  updatedCount: number;
}

/**
 * Merges freshly fetched FlexNow modules of a single semester into an existing
 * set of PathModules - used both by the finish-semester-stepper's "Mit FlexNow
 * abgleichen" step and by FlexnowService.extractCompletedModules (the standalone
 * sync). Matches by ID first, then acronym+semester. A recognized MHB acronym is
 * trusted as a shared key regardless of isUserGenerated/flexNowImported (so a
 * placeholder manually entered with the module's real, official acronym still
 * gets recognized as the same module instead of being duplicated). A free-text
 * (non-MHB) acronym is only trusted once both sides are already known to
 * originate from FlexNow, so an unrelated manual placeholder can't be clobbered
 * by an unrelated FlexNow module that happens to share its made-up acronym.
 * Note this still can't merge a manual placeholder with a FlexNow module
 * representing the same real exam if their acronyms differ entirely - there's
 * no other shared key to match them on. A newly added (unmatched) FlexNow module
 * is always isUserGenerated: false - see the comment at that assignment for why
 * this can't be derived from mhbAcronyms.
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
        flexNowImported: true,
      };
      updatedCount++;
    } else {
      // always false, never mhbAcronyms-derived: during the initial FlexNow import at
      // account creation (upload-student-data-stepper, mode 'update-user') the module
      // handbook can't be loaded yet - which MHB to load is itself only known from this
      // same import's metadata. Deriving isUserGenerated from "is this acronym in the
      // (empty) current MHB" would misflag every real module as a placeholder at that
      // point, which then permanently disagrees with the same module re-synced later
      // (once the MHB is loaded) and duplicates instead of matching. Every module
      // FlexNow reports is a real, official one, so isUserGenerated is always false here.
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
    // a recognized MHB acronym is a reliable identifier on its own - e.g. a
    // manually created placeholder that was typed in with the module's real,
    // official acronym should still be recognized as the same module, even
    // before either side is known to be FlexNow-sourced
    if (mhbAcronyms.has(existing.acronym)) {
      return true;
    }
    // free-text acronyms are not a reliable shared key - only trust the match
    // if both sides are already known to originate from FlexNow, so an
    // unrelated manual placeholder can't be clobbered by an unrelated FlexNow
    // module that happens to coincidentally share its made-up acronym
    if (existing.isUserGenerated || incoming.isUserGenerated) {
      return !!existing.flexNowImported && !!incoming.flexNowImported;
    }
    return true;
  }

  return false;
}
