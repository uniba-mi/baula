import { Component, Input } from '@angular/core';
import { AlertType } from 'src/app/shared/classes/alert';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { Semester } from '../../../../../interfaces/semester';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { Observable, take } from 'rxjs';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  standalone: false
})
export class ImportDialogComponent {
  @Input() importType: string;
  @Input() startSemester: Semester | undefined;
  @Input() studyPlanTemplate$: Observable<StudyPlan> | undefined;
  @Input() isFirstSemesterStudent: boolean | undefined;
  upload: any;
  filename: string | undefined;
  templateFileName: string | undefined;
  file: File | undefined;
  start: Semester | undefined;
  end: Semester | undefined;
  current: Semester = new Semester();
  importFormat: string;
  showRecencyWarning: boolean = false;
  previousSemester: string | undefined;
  loading: boolean = false;

  constructor(private snackbar: SnackbarService, private analytics: AnalyticsService) { }

  ngOnInit() {
    // init logic for template study plans
    if (this.importType === 'deinen Musterplan') {
      this.loading = true;

      if (this.studyPlanTemplate$) {
        this.studyPlanTemplate$.pipe(take(1)).subscribe(
          (studyPlan) => {
            this.loading = false;

            // info for displayal options
            if (studyPlan) {
              this.templateFileName = studyPlan.name;
              const currentSemester = Semester.getCurrentSemesterName();
              const match = this.templateFileName.match(/(\d{4}[sw])/);
              if (match && match[0] !== currentSemester) {
                this.previousSemester = match[0];
                this.showRecencyWarning = true;
              }

              // set studyPlan template as upload
              this.upload = studyPlan;
              this.extractData(this.upload);
            }
          },
          () => {
            this.loading = false;
          }
        );
      }
    }
  }

  uploadedFile(event: Event | FileList) {
    let files: FileList;
    if (event instanceof Event) {
      const target = event.target as HTMLInputElement;
      files = target.files as FileList;
    } else {
      files = event;
    }
    if (Object.values(files)[0].type == 'application/json') {
      // select only the first value of filelist
      this.file = Object.values(files)[0];
      this.filename = this.file.name;

      this.analytics.trackEvent('FileUploaded', { filename: this.filename });

      const fileReader = new FileReader();
      fileReader.readAsText(this.file, 'UTF-8');
      fileReader.onload = () => {
        try {
          this.upload = JSON.parse(fileReader.result as string);
          if (this.importType === 'deinen Studienplan') {

            this.analytics.trackEvent('StudyplanOverwrite', { filename: this.filename });

            this.extractData(this.upload);
          }
        } catch (error) {
          this.file = undefined;
          this.filename = undefined;
          this.snackbar.openSnackBar({
            type: AlertType.DANGER,
            message: 'Die ausgewählte Datei ist keine valide .json-Datei.',
          });
        }
      };
      fileReader.onerror = (error) => {
        console.log(error);
      };
    } else {
      this.snackbar.openSnackBar({
        type: AlertType.DANGER,
        message:
          'Die ausgewählte Datei hat nicht den richtigen Dateityp! Lade bitte eine .json-Datei hoch.',
      });

      this.analytics.trackEvent('InvalidFileType', { message: 'Not JSON' });
    }
  }

  extractData(json: any) {
    if (Array.isArray(json.semesterPlans) && json.semesterPlans.length !== 0) {
      this.start = new Semester(json.semesterPlans[0].semester);
      this.end = new Semester(json.semesterPlans.at(-1).semester);
    }
  }

  generateOutput(json: any): any {
    if (!json) {
      return null;
    }
    switch (this.importFormat) {
      case 'startWithUserStartSemester':
        if (this.startSemester) {
          return this.transformSemesterOfOutput(json, this.startSemester);
        } else {
          return json;
        }
      case 'startWithCurrentSemester':
        return this.transformSemesterOfOutput(json, this.current);
      case 'keepSemesterOfFile':
        return json;
      default:
        if (this.isFirstSemesterStudent && this.startSemester) {
          const startSem = new Semester(this.startSemester.name);
          return this.transformSemesterOfOutput(json, startSem);
        } else {
          return json;
        }
    }
  }

  private transformSemesterOfOutput(json: any, start: Semester): any {
    if (Array.isArray(json.semesterPlans)) {
      const semesters = start.getSemesterList(json.semesterPlans.length);
      for (const [i, value] of json.semesterPlans.entries()) {
        value.semester = semesters[i].name;
      }
    }
    return json;
  }
}
