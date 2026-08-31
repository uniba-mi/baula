import { ExamAttempt } from '@interfaces/study-path';

/**
 * Prüfungsversuche sind die Fakten, `PathModule.status`/`grade` ist ihre Zusammenfassung.
 * Dieser Helper hält die Regeln, nach denen ein Versuch einer Prüfung zugeordnet wird -
 * bewusst frei von Angular-Abhängigkeiten, damit er ohne TestBed testbar bleibt, wie
 * `flex-now-merge.helper.ts`.
 *
 * In diesem Stand schreibt nur der FlexNow-Import Versuche. Die Funktionen für manuelle
 * Eingaben folgen mit der Prüfungshistorie-Oberfläche.
 */

/**
 * FlexNow benutzt "-1" als Sammel-Id für anerkannte Leistungen - rund 12 % der Versuche
 * in den Beispielauszügen tragen sie. Sie identifiziert keine konkrete Prüfung und darf
 * deshalb nie als Schlüssel dienen, sonst fallen unabhängige Anerkennungen zusammen.
 */
const COLLECTIVE_EXAM_ID = '-1';

function isFlexNow(attempt: ExamAttempt): boolean {
  // Bestandsdaten ohne das Feld gelten als manuell - nie gegen `=== false` prüfen
  return attempt.flexNowImported === true;
}

function examKey(examId: string | undefined, name: string): string {
  return examId && examId !== COLLECTIVE_EXAM_ID ? `id:${examId}` : `name:${name}`;
}

/**
 * Übernimmt die Versuche eines FlexNow-Abgleichs in die gespeicherte Historie.
 *
 * Die importierten Versuche ersetzen die zuvor importierten - FlexNow ist für sie die
 * Quelle der Wahrheit. Selbst eingetragene Versuche bleiben dagegen erhalten: FlexNow
 * kennt sie nicht und würde sie bei jedem Abgleich löschen. Nur wenn ein importierter
 * Versuch dieselbe Prüfung im selben Semester abdeckt, weicht der manuelle - beide
 * beschreiben dann dasselbe Ereignis.
 *
 * Liefert der Import für dieses Modul gar keine Versuche, bleibt der gespeicherte Stand
 * unangetastet.
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
