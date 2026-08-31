import { PlanCourse, StudySemester } from "./semester-plan";
import { UserGeneratedModuleTemplate } from "./user-generated-module";

export interface StudyPath {
  completedModules: PathModule[];
  completedCourses: PathCourse[];
}

export interface SemesterStudyPath extends StudySemester {
  modules: PathModule[],
  courses: PathCourse[],
}

// abgeschlossenes bzw. belegtes Modul im Studienverlauf
export interface PathModule extends UserGeneratedModuleTemplate {
  _id?: string;
  semester: string;
  isUserGenerated: boolean;
  flexNowImported: boolean;
  grade: number;
  // optional: wer keine Pruefungsdaten hat, laesst das Feld weg, statt ein leeres
  // Array zu schicken - sonst ueberschreibt der Server die gespeicherte Historie
  examAttempts?: ExamAttempt[];
}

// ein einzelner Pruefungsversuch (FlexNow: Studium/Prfstds/Prfstd)
export interface ExamAttempt {
  examId?: string, // Teilprf/ModulPrf/@ModulPrf - nicht garantiert vorhanden
  name: string, // Teilprf/Bez
  count: number, // Anzahl - Nummer des Versuchs
  grade: number | null, // null, solange der Versuch unbewertet ist
  semester: string, // univis-Format yyyy(s|w), nicht die FlexNow-Apnr
  status: string, // taken | failed | passed
  remark: string, // Pruefungsbemerkung, Prfbem/Bez
  // true = aus FlexNow importiert, false = selbst eingetragen. Bestandsdaten ohne das
  // Feld gelten als manuell - deshalb immer gegen `!== true` pruefen, nie gegen `=== false`
  flexNowImported: boolean
}

export interface PathCourse extends PlanCourse {
  semester: string
}
