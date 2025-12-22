import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { Module } from '../../../../../../../interfaces/module';
import { EMPTY, map, Observable, switchMap, take, tap } from 'rxjs';
import { ModService } from 'src/app/shared/services/module.service';
import { StudyPath } from '../../../../../../../interfaces/study-path';
import { Store } from '@ngrx/store';
import { getFavouriteModuleAcronyms, getExcludedModulesAcronyms, getSemesterList, getUser, getUserStudyPath } from 'src/app/selectors/user.selectors';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { StudyPlanService } from 'src/app/shared/services/study-plan.service';
import { Semester } from '../../../../../../../interfaces/semester';
import { getActiveStudyPlanId, getSemesterPlanIdBySemester } from 'src/app/selectors/study-planning.selectors';
import { ExcludedModuleActions } from 'src/app/actions/user.actions';
import { ListType } from '../../interfaces/list-types';
import { User } from '../../../../../../../interfaces/user';
import { Job } from '../../../../../../../interfaces/job';
import { ModuleWithMetadata, Source } from '../../../../../../../interfaces/recommendation';
import { Topic } from '../../../../../../../interfaces/topic';

@Component({
  selector: 'app-recs-module-card',
  templateUrl: './recs-module-card.component.html',
  styleUrls: ['./recs-module-card.component.scss'],
  standalone: false,
})
export class RecsModuleCardComponent implements OnInit, OnChanges {
  @Input() module: Module | ModuleWithMetadata;
  @Input() allJobs: Job[] | null;
  @Input() allTopics: Topic[] | null;
  @Input() droppedModules: Set<string>;
  @Input() listType: ListType;
  @Input() customStyle: boolean = false; // for reuse with different style
  @Output() moduleMarkedExcluded = new EventEmitter<string>();
  @Output() moduleFavouriteToggled = new EventEmitter<string>();
  user$: Observable<User>;
  studyPath$: Observable<StudyPath>;
  semesters$: Observable<Semester[]>;
  activePlanId: string;
  openedFromModuleOffer: boolean;
  isDragging: boolean = false;
  isSmallScreen: boolean;


  modType: string = 'notPath';
  closeMode: string;
  relevantJobs: Job[] | undefined;
  relevantTopics: Topic[] | undefined;

  private dragEndTime = 0;

  constructor(
    private modService: ModService,
    private store: Store,
    private dialog: MatDialog,
    private studyPlanService: StudyPlanService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.studyPath$ = this.store.select(getUserStudyPath);
    this.semesters$ = this.store.select(getSemesterList);
    this.store.select(getActiveStudyPlanId).pipe(take(1)).subscribe((id) => this.activePlanId = id)

    this.updateRelevantJobsAndTopics();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.module?.currentValue ||
      changes.allJobs?.currentValue ||
      changes.allTopics?.currentValue) {
      this.updateRelevantJobsAndTopics();
    }

    if (changes.droppedModules && !this.droppedModules) {
      this.droppedModules = new Set<string>();
    }
  }

  hasMetadata(module: Module | ModuleWithMetadata): module is ModuleWithMetadata {
    return module && 'metadata' in module;
  }

  updateRelevantJobsAndTopics(): void {
    this.relevantJobs = [];
    this.relevantTopics = [];

    if (!this.module || !this.hasMetadata(this.module)) {
      return;
    }

    const moduleWithMeta = this.module;

    // use moduleWithMeta instead of this.module
    if (this.allTopics && this.allTopics.length > 0) {
      const allTopicSources = moduleWithMeta.metadata?.source?.filter(source => source.type === 'topic') || [];
      this.relevantTopics = this.allTopics.filter((topic: Topic) => {
        return allTopicSources.some(source => source.identifier === topic.tId);
      });
    }

    if (this.allJobs && this.allJobs.length > 0) {
      this.relevantJobs = this.allJobs.filter((job: Job) => {
        return moduleWithMeta.metadata?.source?.some(
          (source: Source) => source.type === 'job' && source.identifier === job._id
        );
      });
    }

    this.cdr.detectChanges();
  }

  getFirstChip(): { displayText: string, type: string } | null {
    if (this.relevantJobs && this.relevantJobs?.length > 0) {
      return { displayText: this.relevantJobs[0].title, type: 'job' };
    }
    if (this.relevantTopics && this.relevantTopics?.length > 0) {
      return { displayText: this.relevantTopics[0].name, type: 'topic' };
    }
    return null;
  }

  getFirstChipTooltip(firstChip: { displayText: string, type: string }): string {
    const typeLabel = firstChip.type === 'job' ? 'Job' : 'Interesse';
    return `Passt zu ${typeLabel}: ${firstChip.displayText}`;
  }

  getTotalChipCount(): number {
    const jobCount = this.relevantJobs?.length || 0;
    const topicCount = this.relevantTopics?.length || 0;
    return jobCount + topicCount;
  }

  getAllChipsTooltip(): string {
    const jobItems = (this.relevantJobs || []).map(job => `${job.title} (Job)`);
    const topicItems = (this.relevantTopics || []).map(topic => `${topic.name} (Interesse)`);

    const allItems = [...jobItems, ...topicItems];
    return `Passt zu:\n ${allItems.join(', ')}`;
  }

  showModuleNameTooltip(element: HTMLElement): boolean {
    return element.scrollHeight > element.clientHeight;
  }

  getJobName(jobId: string): string {
    if (!this.allJobs || !this.allJobs.length) return jobId;

    const job = this.allJobs.find(j => j._id === jobId);
    return job ? job.title : jobId;
  }

  getTopicName(topicId: string): string {
    if (!this.allTopics || !this.allTopics.length) return topicId;

    const topic = this.allTopics.find(t => t.tId === topicId);
    return topic ? topic.name : topicId;
  }

  isFavourite(acronym: string): Observable<boolean> {
    return this.store.select(getFavouriteModuleAcronyms).pipe(
      map((acronyms) => acronyms.includes(acronym))
    );
  }

  isExcluded(acronym: string): Observable<boolean> {
    return this.store.select(getExcludedModulesAcronyms).pipe(
      map((acronyms) => acronyms.includes(acronym))
    );
  }

  isModuleDropped(): boolean {
    return this.module && this.droppedModules && this.droppedModules.has(this.module.acronym);
  }

  isDropped(acronym: string): boolean {
    return this.droppedModules && this.droppedModules.has(acronym);
  }

  onContextMenuClick(event: any) {
    event.stopPropagation();
  }

  onToggleFavourite(event: any, acronym: string): void {
    event.stopPropagation();
    this.moduleFavouriteToggled.emit(acronym);
  }

  markAsExcluded(event: any, acronym: string): void {
    event.stopPropagation();
    this.store.dispatch(ExcludedModuleActions.toggleExcludedModule({ acronym: acronym }))
    this.moduleMarkedExcluded.emit(acronym);
  }

  // open module details dialog
  selectModule(module: Module): void {

    const timeSinceDragEnd = Date.now() - this.dragEndTime;

    // not if the user is dragging stuff and shortly after
    if (this.isDragging || timeSinceDragEnd < 500) {
      return;
    }
    this.modService.openDetailsDialog(module)
  }

  onDragStarted() {
    this.isDragging = true;
  }

  onDragEnded() {
    this.isDragging = false;
    this.dragEndTime = Date.now();
  }

  // open dialog to select semester
  openSelectSemesterDialog(event: any, module: Module) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Semester wählen',
        dialogContentId: 'select-semester-dialog',
        semesters$: this.semesters$,
      },
    });

    dialogRef.afterClosed().pipe(
      switchMap((semester) => {
        if (semester) {
          return this.store.select(getSemesterPlanIdBySemester(semester)).pipe(
            take(1),
            tap((semesterPlanId) => {
              if (semesterPlanId) {
                this.studyPlanService.addModuleToPlan(module, semesterPlanId, this.activePlanId);
                this.markModuleAsDropped(module.acronym);
              } else {
                console.error('Keine ID gefunden für Semester:', semester);
              }
            })
          );
        } else {
          return EMPTY;
        }
      }),
      take(1)
    ).subscribe();
  }

  markModuleAsDropped(acronym: string) {
    if (this.droppedModules) {
      this.droppedModules.add(acronym);
    }
  }

  getFeedbackSources(): Source[] {
    if (!this.hasMetadata(this.module)) {
      return [];
    }
    const moduleWithMeta = this.module;
    return moduleWithMeta.metadata?.source?.filter(
      (source: Source) => source.type === 'feedback_similarmods'
    ) || [];
  }

  hasFeedbackSource(): boolean {
    return this.getFeedbackSources().length > 0;
  }

  getFeedbackScore(): number | null {
    const feedbackSources = this.getFeedbackSources();
    if (feedbackSources.length === 0) return null;

    // chip styling uses highest score
    return Math.max(...feedbackSources.map(s => s.score || 0));
  }

  getFeedbackIcon(): string {
    const score = this.getFeedbackScore();
    if (score === 1.0) {
      return 'bi-emoji-heart-eyes'; // 5 stars
    }
    return 'bi-emoji-laughing'; // 4 stars
  }

  getFeedbackChipClass(): string {
    const score = this.getFeedbackScore();
    if (score !== 1.0) {
      return 'feedback-chip-light';
    }
    return 'feedback-chip'
  }

  // identifier is rated acronym
  getFeedbackTooltip(): string {
    const feedbackSources = this.getFeedbackSources();
    if (feedbackSources.length === 1) {
      return `Könnte dir aufgrund deines Feedbacks zu ${feedbackSources[0].identifier} gefallen`;
    }
    const identifiers = feedbackSources.map(s => s.identifier).join(' und ');
    return `Könnte dir aufgrund deines Feedbacks zu ${identifiers} gefallen`;
  }
}