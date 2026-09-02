import { ExamAttempt } from '@interfaces/study-path';

// Helpers for the exam attempts of a PathModule. Free of Angular dependencies so the
// merge rules stay testable without TestBed, like flex-now-merge.helper.ts.

// FlexNow uses "-1" as a collective id for recognized achievements, so it does not
// identify a single exam - fall back to the exam name in that case
const COLLECTIVE_EXAM_ID = '-1';

function isFlexNow(attempt: ExamAttempt): boolean {
  // attempts stored before this field existed count as manual
  return attempt.flexNowImported === true;
}

function examKey(examId: string | undefined, name: string): string {
  return examId && examId !== COLLECTIVE_EXAM_ID ? `id:${examId}` : `name:${name}`;
}

/**
 * Merges the attempts of a FlexNow sync into the stored ones. Imported attempts replace
 * the previously imported ones, manually entered attempts are kept - unless an imported
 * attempt covers the same exam in the same semester. If the import brings no attempts
 * for this module, the stored ones are left untouched.
 */
export function mergeFlexNowAttempts(
  stored: ExamAttempt[] | undefined,
  imported: ExamAttempt[] | undefined,
): ExamAttempt[] {
  const importedAttempts = imported ?? [];
  if (importedAttempts.length === 0) {
    return [...(stored ?? [])];
  }

  const keptManual = (stored ?? []).filter(
    (attempt) =>
      !isFlexNow(attempt) &&
      !importedAttempts.some(
        (fnAttempt) =>
          examKey(fnAttempt.examId, fnAttempt.name) ===
            examKey(attempt.examId, attempt.name) &&
          fnAttempt.semester === attempt.semester,
      ),
  );

  return [...keptManual, ...importedAttempts];
}
