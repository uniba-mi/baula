import { Injectable } from '@angular/core';
import { User } from '../../../../../interfaces/user';
import {
  PathCourse,
  PathModule,
} from '../../../../../interfaces/study-path';
import { TransformationService } from './transformation.service';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { SemesterPlan } from '../../../../../interfaces/semester-plan';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  constructor(private transform: TransformationService) { }

  // function to export data for reimport -> export json-file
  downloadJSONFile(content: any, filename: string) {
    // Use FileService to generate a file (optional)
    const fileBlob = new Blob([JSON.stringify(content)], { type: 'application/json' });

    // Create a Blob URL for the file and trigger the download
    const blobUrl = URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // function for pdf export of user data
  async downloadUserData(userData: User, studyPlans: StudyPlan[]) {
    // preload courses and studyprogrammes asyncronisly
    const courses = await this.generateTableOfCourses(
      userData.studyPath.completedCourses
    );
    const studprogrammes = await this.transform.transformStudyProgramme(
      userData.sps
    );

    const favouriteModules = this.transform.transformModuleIdsToAcronyms(userData.favouriteModulesAcronyms)
    const excludedModules = this.transform.transformModuleIdsToAcronyms(userData.excludedModulesAcronyms)

    // Consents table
    const consentsTable = {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*'],
        body: [
          ['Typ', 'Eingewilligt', 'Gesehen', 'Zeitstempel'],
          ...userData.consents.map(consent => [
            consent.ctype,
            consent.hasConfirmed ? 'Ja' : 'Nein',
            consent.hasResponded ? 'Ja' : 'Nein',
            this.transform.transformDate(consent.timestamp)
          ])
        ]
      },
      margin: [0, 10, 0, 10]
      // TODO module feedback
    };

    // set the content of the pdf file
    const content = [
      { text: 'Deine Daten in Baula', style: 'header' },
      {
        text: 'Hier findest du eine Auflistung aller Daten, die zu deinem Account in Baula gespeichert sind.',
        margin: [0, 0, 0, 10],
      },
      /* listing of general user data */
      { text: 'Nutzerdaten', style: 'subheader' },
      {
        style: 'listing',
        ul: [
          `Rollen: ${userData.roles.join(', ')}`,
          `Studiengang: ${studprogrammes}`,
          `Start Semester: ${this.transform.transformUnivIsSemester(
            userData.startSemester
          )}`,
          `Studiendauer (geplant): ${userData.duration}`,
          `ECTS (gesamt): ${userData.maxEcts}`,
          `Account erstellt am ${this.transform.transformDate(
            userData.createdAt
          )}`,
          `Account zuletzt aktualisiert am ${this.transform.transformDate(
            userData.updatedAt
          )}`,
          `Deine gemerkten Module: ${favouriteModules}`,
          `Module, die nicht mehr vorgeschlagen werden: ${excludedModules}`,
        ],
        margin: [0, 0, 0, 10],
      },
      /* table of courses from study path */
      {
        text: 'Bisherige Lehrveranstaltungen',
        style: 'subheader',
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          width: ['*', '*', '*'],
          body: courses,
        },
        margin: [0, 0, 0, 20],
      },
      /* table of modules from study path */
      {
        text: 'Bisherige Module',
        style: 'subheader',
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          width: ['*', '*', '*', '*'],
          body: this.generateTableOfModules(
            userData.studyPath.completedModules
          ),
        },
        margin: [0, 0, 0, 20],
      },
      /* section for study plans, each study plan has a small heading and a table */
      {
        text: 'Studienpläne',
        style: 'subheader',
      },
      ...this.generateStudyPlansOutput(studyPlans),

      /* Consents */
      {
        text: 'Einwilligungen (Datenschutz)',
        style: 'subheader',
      },
      consentsTable
    ];

    // generate the pdf file
    this.generatePdf(content, 'user.pdf');
  }

  // function for pdf generation, also usable for other information than user data
  private async generatePdf(content: any[], filename: string): Promise<void> {
    const styles = {
      header: {
        fontSize: 18,
        bold: true,
        lineHeight: 1.5,
      },
      subheader: {
        fontSize: 15,
        bold: true,
        lineHeight: 1.5,
      },
      listing: {
        lineHeight: 1.1,
      },
    };

    /* lazy load pdfmake to prevent load issues */
    const documentDefinition = { content, styles };
    pdfMake.createPdf(documentDefinition, undefined, undefined, pdfFonts.vfs).download('user.pdf');
  }

  /*###################################################### 
  ## Helper functions for transformation of text output ##
  ########################################################*/
  // generates the module tables for pdf export
  private generateTableOfModules(input: PathModule[]): any[] {
    let result = [['Kürzel', 'Status', 'Note', 'Semester']];
    for (let entry of input) {
      let status = entry.status
        ? this.transform.transformStatus(entry.status)
        : '-';
      let grade = entry.grade ? entry.grade.toString() : '-';
      result.push([
        entry.acronym,
        status,
        grade,
        this.transform.transformUnivIsSemester(entry.semester),
      ]);
    }
    return result;
  }

  // generates the course tables for pdf export
  private async generateTableOfCourses(input: PathCourse[]): Promise<any[]> {
    let result = [['ID', 'Status', 'Semester']];
    for (let entry of input) {
      result.push([
        await this.transform.transformUnivIsKeys(entry.id, entry.semester),
        this.transform.transformStatus(entry.status),
        this.transform.transformUnivIsSemester(entry.semester),
      ]);
    }
    return new Promise((resolve) => {
      resolve(result);
    });
  }

  // generates the study plan output for the pdf export
  private generateStudyPlansOutput(studyPlans: StudyPlan[]): any {
    let output = [];
    for (let studyPlan of studyPlans) {
      output.push(
        {
          text: `${studyPlan.name} (${studyPlan.status ? 'aktiv' : 'passiv'
            }) - erstellt am ${this.transform.transformDate(
              studyPlan.createdAt
            )}`,
          margin: [0, 0, 0, 10],
        },
        {
          layout: 'lightHorizontalLines',
          table: {
            headerRows: 1,
            width: ['*', 'auto', '*', '*', '*'],
            body: [
              [
                'Semester',
                'Eingeplante Module',
                'Eingeplante Platzhalter',
                'Ziel ECTS',
                'Stand ECTS',
              ],
              ...this.generateStudyPlanTable(studyPlan.semesterPlans),
            ],
          },
          margin: [0, 0, 0, 20],
        }
      );
    }
    return output;
  }

  // generates the study plan table for a single study plan, is used to generate the whole output of study plans
  private generateStudyPlanTable(semesterPlans: SemesterPlan[]): any[] {
    let output = [];
    for (let semesterPlan of semesterPlans) {
      output.push([
        this.transform.transformUnivIsSemester(semesterPlan.semester),
        this.transform.transformModuleIdsToAcronyms(semesterPlan.modules),
        this.transform.transformUserGeneratedModulesToString(semesterPlan.userGeneratedModules),
        semesterPlan.aimedEcts,
        semesterPlan.summedEcts,
      ]);
    }
    return output;
  }
}
