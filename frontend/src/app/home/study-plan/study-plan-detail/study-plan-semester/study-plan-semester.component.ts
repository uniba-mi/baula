import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import {
  getSemesterList,
  getUserStudyPath,
} from 'src/app/selectors/user.selectors';
import {
  MetaSemester,
  SemesterPlan,
} from '../../../../../../../interfaces/semester-plan';
import { getSelectedStudyPlanId, getSemesterPlansOfSelectedStudyPlan } from 'src/app/selectors/study-planning.selectors';
import { SemesterStudyPath } from '../../../../../../../interfaces/study-path';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { Semester } from '../../../../../../../interfaces/semester';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropService } from 'src/app/shared/services/drag-drop.service';

@Component({
  selector: 'app-study-plan-semester',
  templateUrl: './study-plan-semester.component.html',
  styleUrls: ['./study-plan-semester.component.scss'],
  standalone: false
})
export class StudyPlanSemesterComponent {
  @Input() metaSemester: MetaSemester;
  @Input() semesterNumber: number;
  @Input() isPastSemester: boolean = false;
  @Input() eligibleSemesterId: string | null;
  @Input() isExpanded: boolean;
  @Output() finishSemester = new EventEmitter<SemesterPlan>();
  @Output() toggleExpanded = new EventEmitter<string>(); // emits semester name

  activeSemesters: string[];
  activeSemesters$: Observable<string[]>;
  studyPlanId: string;
  semesterPlan: SemesterPlan;

  semesterStudyPath$: Observable<SemesterStudyPath[]>;

  private destroy$ = new Subject<void>();
  connectedDropListIds: string[];
  isEligibleForFinish: boolean = false;

  constructor(
    private store: Store,
    private transform: TransformationService,
    private dragDropService: DragDropService,
  ) { }

  ngOnInit() {
    this.activeSemesters$ = this.store.select(getSemesterList).pipe(
      map((semesterList) => semesterList.map((semester) => semester.name))
    );

    // fetch studyPlanId for both children
    this.store.select(getSelectedStudyPlanId).pipe(take(1)).subscribe((studyPlanId) => {
      this.studyPlanId = studyPlanId
    })

    // set current semester plan by fetching full details with MetaSemester for both children
    this.store.select(getSemesterPlansOfSelectedStudyPlan)
      .pipe(
        filter(semesterPlans => !!semesterPlans && semesterPlans.length > 0),
        map(semesterPlans => {

          // set connected drop lists (no past semesters)
          this.connectedDropListIds = semesterPlans
            .filter(plan => plan.semester !== this.metaSemester.semester && !plan.isPastSemester)
            .map(plan => plan._id);

          // add sidenav list
          if (!this.metaSemester.isPastSemester) {
            this.connectedDropListIds.push('sidenav-drop-list');
          }

          return semesterPlans.find(plan => plan.semester === this.metaSemester.semester);
        }),
        filter(plan => !!plan),
        takeUntil(this.destroy$)
      )
      .subscribe(plan => {
        this.semesterPlan = plan;

        // pass eligible state down to children
        this.isEligibleForFinish = (plan._id === this.eligibleSemesterId);
      });

    // get study path data for this semester for target ects in header and study path cards
    this.semesterStudyPath$ = this.store.select(getUserStudyPath).pipe(
      switchMap((studyPath) =>
        this.transform.transformStudyPath(studyPath, [new Semester(this.metaSemester.semester)])
      )
    );
  }

  handleFinishSemester(semesterPlan: SemesterPlan): void {
    this.finishSemester.emit(semesterPlan);
  }

  isCurrentSemester(): boolean {
    const currentSemester = new Semester();
    return this.metaSemester.semester === currentSemester.name;
  }

  isOldestPastSemester(): boolean {
    return (this.semesterNumber === 1 && this.metaSemester.isPastSemester) ? true : false;
  }

  onDrop(event: CdkDragDrop<any>) {

    if (event.previousContainer === event.container) {
      return;
    }

    const item = event.item.data;

    const sourceContainerId = event.previousContainer.id;
    const sourceSemester = event.previousContainer.data?.semester || '';
    const targetContainerId = event.container.id;
    const targetSemester = this.semesterPlan.semester;

    this.dragDropService.handleDrop(
      item,
      sourceContainerId,
      sourceSemester,
      targetContainerId,
      targetSemester,
      this.studyPlanId,
      this.metaSemester.isPastSemester
    );
  }

  onToggleExpanded() {
    this.toggleExpanded.emit(this.metaSemester.semester);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}