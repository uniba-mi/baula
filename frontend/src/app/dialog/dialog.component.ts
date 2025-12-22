import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Module } from '../../../../interfaces/module';
import { UserGeneratedModule } from '../../../../interfaces/user-generated-module';
import { Semester } from '../../../../interfaces/semester';
import { StudyPlan, StudyPlanTemplate } from '../../../../interfaces/study-plan';
import { Status, User } from '../../../../interfaces/user';
import { Standard } from '../modules/bilapp/interfaces/standard';
import { PathModule, SemesterStudyPath } from '../../../../interfaces/study-path';
import { ExtendedModuleGroup } from '../../../../interfaces/module-group';
import { AcademicDate } from '../../../../interfaces/academic-date';
import { Course } from '../../../../interfaces/course';
import { Job, Jobtemplate } from '../../../../interfaces/job';

export interface DialogData {
  dialogTitle?: String; // heading
  dialogContentId: String; // for subdialog insertion
  studyPlan?: StudyPlanTemplate;
  module?: UserGeneratedModule;
  semesters$?: Observable<Semester[]>;
  statusSemester?: string;
  selectedSemester$?: Observable<string>;
  selectedModule?: Module;
  user?: User;
  aimedEcts?: number;
  grade?: number;
  minGrade?: number;
  maxGrade?: number;
  mgId?: string;
  structuredModuleGroups$?: Observable<ExtendedModuleGroup[]>;
  modules?: Module[];
  statusOptions?: Status[];
  status?: string;
  semesterPlanId?: string;
  job?: Jobtemplate | Job;
  standard?: Standard;
  importType?: string;
  studyPath?: SemesterStudyPath[];
  startSemester?: Semester;
  studyPlans?: StudyPlan[];
  activeStudyPlan?: StudyPlan;
  studyPlanTemplate$?: Observable<StudyPlan>;
  newPlanId?: string;
  missingModules?: PathModule[];
  pathModule?: PathModule;
  showMgWizard?: boolean;
  academicDate?: AcademicDate;
  mode?: string;
  course?: Course;
  courses?: Course[];
  deselectOption?: boolean;
  options?: { value: string, label: string }[]; // for generic choose option dialog
  isFirstSemesterStudent?: boolean;
  content?: any; // just for evaluation
}

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    standalone: false
})
export class DialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void { }
}
