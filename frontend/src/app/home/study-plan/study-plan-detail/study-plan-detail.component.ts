import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, forkJoin, of } from 'rxjs';
import {
  SemesterPlanActions,
  StudyPlanActions,
} from 'src/app/actions/study-planning.actions';
import { User } from '../../../../../../interfaces/user';
import {
  getSemesterList,
  getUser,
  getUserStudyPath,
  getUserStudyprogrammes,
} from 'src/app/selectors/user.selectors';
import { Router, ActivatedRoute } from '@angular/router';
import {
  PathModule,
  SemesterStudyPath,
  StudyPath,
} from '../../../../../../interfaces/study-path';
import {
  SemesterPlan,
  MetaSemester,
  PlanningHints,
} from '../../../../../../interfaces/semester-plan';
import { Semester } from '../../../../../../interfaces/semester';
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import {
  getActiveStudyPlanId,
  getPlannedModulesOfActiveStudyPlan,
  getPlanningHints,
  getSelectedStudyPlan,
  getSelectedStudyPlanId,
  getSemesterPlansOfSelectedStudyPlan,
  getStudyPlans,
} from 'src/app/selectors/study-planning.selectors';
import {
  filter, first, map,
  shareReplay,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { UserGeneratedModule } from '../../../../../../interfaces/user-generated-module';
import { getModuleByAcronym, getOldModuleByAcronym } from 'src/app/selectors/module-overview.selectors';
import { StudyPathActions, UserActions } from 'src/app/actions/user.actions';
import { StudyPlan } from '../../../../../../interfaces/study-plan';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { getCloseDialogMode } from 'src/app/selectors/dialog.selectors';
import { FlexnowService } from 'src/app/shared/services/flex-now.service';
import { ModService } from 'src/app/shared/services/module.service';
import { PlanningValidationService } from 'src/app/shared/services/planning-validation.service';
import { StudyPlanService } from 'src/app/shared/services/study-plan.service';

@Component({
  selector: 'app-study-plan-detail',
  templateUrl: './study-plan-detail.component.html',
  styleUrls: ['./study-plan-detail.component.scss'],
  standalone: false,
})
export class StudyPlanDetailComponent implements OnInit {
  @ViewChild('sidenav') sidenav: MatSidenav;

  maintenance = false; // Variable to disable features and make maintenance message visible
  user$: Observable<User>;
  user: User;
  studyPath$: Observable<StudyPath>;
  studyPlanId: string;
  semesterPlans$: Observable<SemesterPlan[] | undefined>;
  metaSemesters$: Observable<MetaSemester[]>; // will be filled based on semesterPlans$
  activeSemesters$: Observable<string[]>;
  semesters$: Observable<Semester[]>;
  semesterStudyPath$: Observable<SemesterStudyPath[]>; // study path separated by semester
  selectedStudyPlanId: string;
  selectedStudyPlan$: Observable<StudyPlan | undefined>;
  spId: string;
  selectedSemesterPlans$: Observable<SemesterPlan[] | undefined>;
  studyPlanDetailHint: string = 'studyPlanDetail-hint';
  studyPlanDetailMessage: string =
    'Hier hast du die Möglichkeit, dein ganzes Studium zu planen. Plane, welche Module du in welchem Semester belegen möchtest und überprüfe, ob du damit alle ECTS-Vorgaben deines Studiums erreichst. Platzhalter erlauben es Dir, individuelle Inhalte anzulegen. Wenn du die Seitenleiste ausklappst, siehst du Modulempfehlungen für deinen Studiengang.';

  // conditions for sidenav to open
  isActivePlan$: Observable<boolean>;
  plannedModules$: Observable<string[] | undefined>;

  // scrolling
  canScrollLeft = false;
  canScrollRight = false;
  private resizeObserver?: ResizeObserver;
  @ViewChild('semesterContainer', { static: false }) semesterContainer!: ElementRef;

  displayProgressBar: boolean = false;
  hintsOpened = false;
  hints: PlanningHints[] = [];
  hintsIconColor: string = 'standard';

  private destroy$ = new Subject<void>();

  eligibleSemesterId: string | null = null; // semester id that can be finished
  isSmallScreen: boolean = false;
  expandedSemesters: { [semesterName: string]: boolean } = {};
  closeMode: string;
  availableSemesters$: Observable<Semester[]>;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private transform: TransformationService,
    private studyPlanService: StudyPlanService,
    private cdr: ChangeDetectorRef,
    private screenSizeService: ScreenSizeService,
    private flexnowService: FlexnowService,
    private modService: ModService,
    private validation: PlanningValidationService,
  ) { }

  ngOnInit(): void {
    this.user$ = this.store.pipe(select(getUser));
    this.user$.pipe(take(1)).subscribe((user) => {
      this.user = user;
    });
    this.semesterPlans$ = this.store.select(
      getSemesterPlansOfSelectedStudyPlan
    );

    /** transform semesterPlans$ into metaSemesters$ so initial details for display are given and additional info (different for path and plan)
     *  are loaded by children directly. Avoids redundancy in this component.*/
    this.metaSemesters$ = this.semesterPlans$.pipe(
      map(semesterPlans => {
        if (!semesterPlans) return [];

        return semesterPlans.map(plan => {
          const metaSemester: MetaSemester = {
            semester: plan.semester,
            isPastSemester: plan.isPastSemester,
            expanded: plan.expanded
          };
          return metaSemester;
        });
      }),
      shareReplay(1) // caching
    );

    this.semesterPlans$.subscribe((semesterPlans) => {
      if (semesterPlans) {

        const eligibleSemesterPlan =
          this.getEarliestEligibleSemester(semesterPlans);

        if (eligibleSemesterPlan) {
          this.eligibleSemesterId = !this.isCurrentSemester(eligibleSemesterPlan.semester) ? eligibleSemesterPlan._id : null
        }

      } else {
        this.eligibleSemesterId = null;
      }
    });

    this.studyPath$ = this.store.select(getUserStudyPath);
    this.semesters$ = this.store.select(getSemesterList);

    // for flexnow
    this.availableSemesters$ = this.semesters$.pipe(
      map(semesters => semesters.filter(semester => !semester.isFutureSemester()))
    );

    this.selectedStudyPlan$ = this.store.select(getSelectedStudyPlan);

    this.route.params.subscribe((param) => {
      this.studyPlanId = param.id;
      this.store.dispatch(
        StudyPlanActions.selectStudyPlan({ studyPlanId: this.studyPlanId })
      );

      // load expanded state of semesters
      this.loadAllExpandedStates();
    });

    this.store
      .select(getSelectedStudyPlanId)
      .pipe(take(1))
      .subscribe((selectedPlanId) => {
        if (this.selectedStudyPlanId) {
          this.selectedStudyPlanId = selectedPlanId;
        }
      });

    this.activeSemesters$ = this.store.select(getSemesterList).pipe(
      map((semesterlist): string[] => semesterlist.map(semester => semester.name))
    );

    this.updateSemesterStudyPath();

    this.store
      .select(getStudyPlans)
      .pipe(take(1))
      .subscribe((studyPlans) => {
        this.studyPlanService.updateStudyPlans(studyPlans);
      });

    this.isActivePlan$ = combineLatest([
      this.store.select(getSelectedStudyPlanId),
      this.store.select(getActiveStudyPlanId),
    ]).pipe(
      map(
        ([selectedStudyPlanId, activeStudyPlanId]) =>
          selectedStudyPlanId === activeStudyPlanId
      )
    );

    this.store.select(getUserStudyprogrammes).subscribe((studyprogrammes) => {
      if (studyprogrammes && studyprogrammes.length > 0) {
        this.spId = studyprogrammes[0].spId;
      }
    });

    this.plannedModules$ = this.store.select(
      getPlannedModulesOfActiveStudyPlan
    );

    this.screenSizeService.isSmallScreen$.pipe(take(1)).subscribe(isSmall => {
      this.isSmallScreen = isSmall;
    });

    combineLatest([
      this.selectedStudyPlan$,
      this.isActivePlan$
    ]).pipe(
      takeUntil(this.destroy$),
      filter(([plan, isActive]) => !!plan && isActive === true)
    ).subscribe(([studyPlan]) => {
      if (studyPlan) {
        this.validation.checkForModulePlanningHints(studyPlan);
      }
    });

    this.store
      .select(getPlanningHints)
      .pipe(
        takeUntil(this.destroy$),
        map(hints => hints.filter(h => h.context === 'module-planning'))
      )
      .subscribe((hints) => {
        this.hints = hints;
        this.updateHintsIconColor(hints);
        this.cdr.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    this.metaSemesters$.pipe( // wait for data
      filter(metaSemesters => !!metaSemesters && metaSemesters.length > 0),
      take(1)
    ).subscribe(() => {
      setTimeout(() => {
        this.updateScrollState();
        this.setupScrollObserver();
      }, 100);
    });
  }

  updateHintsIconColor(hints: PlanningHints[]) {
    if (hints.length === 0) {
      this.hintsIconColor = 'standard';
    } else {
      const hasDangerOrCollision = hints.some(
        hint => hint.type === 'collision' || hint.type === 'risk'
      );

      const hasWarning = hints.some(hint => hint.type === 'warning');

      if (hasDangerOrCollision) {
        this.hintsIconColor = 'danger';
      } else if (hasWarning) {
        this.hintsIconColor = 'warning';
      } else {
        this.hintsIconColor = 'standard';
      }
    }
  }

  onSemesterToggled(semesterName: string): void {
    this.expandedSemesters[semesterName] = !this.expandedSemesters[semesterName];
    this.saveExpandedState(semesterName);
    setTimeout(() => {
      this.updateScrollState();
    }, 0);
  }

  toggleHints() {
    this.hintsOpened = !this.hintsOpened;
    this.cdr.detectChanges();
  }

  private loadAllExpandedStates(): void {
    const key = `semester-expanded-${this.studyPlanId}`;
    const savedState = JSON.parse(localStorage.getItem(key) || '{}');
    this.expandedSemesters = { ...savedState };
  }

  private saveExpandedState(semesterName: string): void {
    const key = `semester-expanded-${this.studyPlanId}`;
    localStorage.setItem(key, JSON.stringify(this.expandedSemesters));
  }

  isExpanded(semesterName: string): boolean {
    return this.expandedSemesters[semesterName] ?? true; // default to expanded
  }

  importCompleteFlexNowData() {
    this.flexnowService.triggerFlexNowDataLoading(this.availableSemesters$);
  }

  private setupScrollObserver(): void {
    if (!this.semesterContainer) return;

    const container = this.semesterContainer.nativeElement;

    container.addEventListener('scroll', () => this.updateScrollState());

    this.resizeObserver = new ResizeObserver(() => {
      setTimeout(() => this.updateScrollState(), 0);
    });

    this.resizeObserver.observe(container);
  }

  scrollLeft(): void {
    if (this.semesterContainer && this.canScrollLeft) {
      const container = this.semesterContainer.nativeElement;
      const scrollAmount = 320; // slightly more than semester col width (300px + gap)

      container.scrollTo({
        left: container.scrollLeft - scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  scrollRight(): void {
    if (this.semesterContainer && this.canScrollRight) {
      const container = this.semesterContainer.nativeElement;
      const scrollAmount = 320; // slightly more than semester col width (300px + gap)

      container.scrollTo({
        left: container.scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  onScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    if (!this.semesterContainer) return;

    const container = this.semesterContainer.nativeElement;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    this.canScrollLeft = scrollLeft > 0;
    this.canScrollRight = scrollLeft < (scrollWidth - clientWidth - 1);
  }

  toggleProgressBar() {
    this.displayProgressBar = !this.displayProgressBar;
  }

  getMatchingSemesterPlan(semesterPlans: SemesterPlan[], semesterName: string): SemesterPlan | undefined {
    return semesterPlans.find(plan => plan.semester === semesterName);
  }

  // checking which semester plan is the earliest which is not in the past (= semester plan to be finished by the user)
  getEarliestEligibleSemester(semesterPlans: SemesterPlan[]): SemesterPlan | null {
    if (!semesterPlans || semesterPlans.length === 0) {
      return null;
    }
    const upcomingSemesters = semesterPlans.filter((sp) => !sp.isPastSemester);
    const sortedSemesters = upcomingSemesters.sort((a, b) =>
      a.semester.localeCompare(b.semester)
    );
    return sortedSemesters.length > 0 ? sortedSemesters[0] : null;
  }

  handleFinishSemester(semesterPlan: SemesterPlan): void {
    if (semesterPlan._id === this.eligibleSemesterId) {
      this.openFinishSemesterDialog(semesterPlan);
    } else {
      return;
    }
  }

  isCurrentSemester(semesterName: string): boolean {
    const currentSemester = new Semester();
    return semesterName === currentSemester.name;
  }

  getNextSemester(metaSemesters: MetaSemester[], currentIndex: number): MetaSemester | null {
    return currentIndex + 1 < metaSemesters.length ? metaSemesters[currentIndex + 1] : null;
  }

  // updates the displayal of semesters in the component
  updateSemesterStudyPath() {
    this.semesterStudyPath$ = combineLatest([
      this.studyPath$,
      this.semesters$,
    ]).pipe(
      switchMap(([studyPath, semesters]) =>
        this.transform.transformStudyPath(studyPath, semesters)
      )
    );
  }

  toggleSidenav() {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  onRecsSidenavTabClicked(tabIndex: number): void {
    if (this.sidenav) {
      if (!this.sidenav.opened) { // opens when tab is clicked
        this.sidenav.open();
      }
    }
  }

  onRecsSidenavClosed(): void {
    if (this.sidenav) {
      if (this.sidenav.opened) { // close when close button is clicked
        this.sidenav.close();
      }
    }
  }

  // for conditional display of adding semester option
  isLastSemesterActive(
    metaSemesters: MetaSemester[],
    activeSemesters: string[]
  ): boolean {
    if (!metaSemesters || metaSemesters.length === 0) {
      return false;
    }
    const lastSemester = metaSemesters[metaSemesters.length - 1];
    return activeSemesters.includes(lastSemester.semester);
  }

  openAddSemesterDialog(): void {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Weiteres Semester anhängen?',
      actionType: 'add',
      warningMessage:
        'Bitte füge nur ein Semester hinzu, wenn du auch wirklich ein weiteres Semester studierst, denn hierdurch wird die Studienzeit in deinem Profil verlängert.',
      confirmationItem: 'ein neues Semester',
      confirmButtonLabel: 'Hinzufügen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-primary',
      callbackMethod: () => {
        this.addSemester();
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  openModuleDetails(acronym: string) {
    this.modService.selectModuleFromAcronymString(acronym);
  }

  addSemester() {
    this.store
      .select(getSelectedStudyPlan)
      .pipe(take(1))
      .subscribe((currentStudyPlan) => {
        if (!currentStudyPlan) return;

        let semesterPlans: SemesterPlan[] = [...currentStudyPlan.semesterPlans];

        // find last semester of current semester plans to know what to append
        const lastSemOfPlan =
          semesterPlans.length > 0
            ? new Semester(semesterPlans[semesterPlans.length - 1].semester)
            : null;

        // generate next semester
        const sem = new Semester();
        const nextSem: Semester = lastSemOfPlan
          ? sem.getNextSemester(lastSemOfPlan)
          : sem;

        // create new semester plan and add it to the semester plans within the current study plan
        this.store.dispatch(
          SemesterPlanActions.addSemesterPlanToStudyPlan({
            studyPlanId: this.studyPlanId,
            semester: nextSem.name,
          })
        );

        setTimeout(() => { // TODO check if this works on test
          this.updateScrollState();
        }, 50);

        // need current user state
        this.user$.pipe(take(1)).subscribe((user) => {
          // update user profile (study duration), adding one semester
          if (user.duration) {
            // Calculate the user's last semester based on startsemester and duration
            const userStartSemester = new Semester(user.startSemester);
            const userLastSemester = userStartSemester
              .getSemesterList(user.duration)
              .pop();

            // only update user profile with the new end semester if the last semester is the same as in the plan before adding the semester
            // to prevent that user profile duration is prolonged multiple times from adding semesters to several study plans
            if (
              lastSemOfPlan &&
              userLastSemester &&
              lastSemOfPlan.name === userLastSemester.name
            ) {
              const updatedUser: User = {
                ...user,
                duration: user.duration + 1,
              };
              this.store.dispatch(
                UserActions.updateUser({ user: updatedUser })
              );
            }
          }
        });
      });

    this.dialog.closeAll();
  }

  // finish semester: transition from plan semester to study path semester
  openFinishSemesterDialog(semesterPlan: SemesterPlan) {
    const {
      modules: semesterModuleStrings,
      userGeneratedModules: semesterUserGeneratedModules,
    } = semesterPlan;

    if (
      semesterModuleStrings.length === 0 &&
      semesterUserGeneratedModules.length === 0
    ) {
      this.confirmFinishingEmptySemester(semesterPlan.semester);
      return;
    }

    const pathModuleObservable =
      semesterModuleStrings.length > 0
        ? forkJoin(
          semesterModuleStrings.map((acronym) =>
            this.getModuleDetailsWithStatus(acronym, semesterPlan)
          )
        )
        : of([]);

    const userGeneratedModuleObservable =
      semesterUserGeneratedModules.length > 0
        ? this.appendStatusAndGradeToUserGeneratedModules(
          semesterUserGeneratedModules, semesterPlan.semester
        )
        : of([]);

    // fetch all modules with details and statuses
    forkJoin([pathModuleObservable, userGeneratedModuleObservable]).subscribe(
      ([modules, updatedUserGeneratedModules]) => {
        // build pathModules from the semester plan's modules and userGeneratedModules
        const pathModules: PathModule[] = modules.filter(
          (module): module is PathModule => module !== null
        );

        // add userGeneratedModules to pathModules
        updatedUserGeneratedModules.forEach((userGeneratedMod) => {
          const userGeneratedPathMod: PathModule = {
            _id: userGeneratedMod._id,
            acronym: userGeneratedMod.acronym,
            name: userGeneratedMod.name,
            ects: userGeneratedMod.ects,
            status: userGeneratedMod.status,
            mgId: userGeneratedMod.mgId ? userGeneratedMod.mgId : 'init', // take mg else init
            semester: semesterPlan.semester,
            isUserGenerated: true,
            flexNowImported: userGeneratedMod.flexNowImported,
            grade: userGeneratedMod.grade || 0,
          };

          pathModules.push(userGeneratedPathMod);
        });

        const dialogRef = this.dialog.open(DialogComponent, {
          data: {
            dialogTitle: 'Semester abschließen',
            dialogContentId: 'finish-semester-stepper',
            missingModules: pathModules.length > 0 ? pathModules : [], // opens for all (user generated) modules, can also be empty
          },
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (result.emptySelect && !result.droppedModules) {
              this.updateIsPastSemestersForAllPlans(semesterPlan.semester)
            } else { // semester finish with data
              this.handleSemesterFinishResult(result.pathModules, semesterPlan, result.droppedModules);
            }
          }
        });
      }
    );
  }

  handleSemesterFinishResult(pathModules: PathModule[], semesterPlan: SemesterPlan, droppedModules: PathModule[]) {

    if (pathModules.length > 0 || droppedModules.length > 0) {

      this.store.dispatch(
        StudyPathActions.finishSemester({
          completedModules: pathModules,
          droppedModules: droppedModules,
          semester: semesterPlan.semester
        })
      );

      this.store.select(getStudyPlans).pipe(
        map(updatedStudyPlans => {
          return updatedStudyPlans.some(plan =>
            plan.semesterPlans.some(sp =>
              sp.semester === semesterPlan.semester && sp.isPastSemester === true
            )
          );
        }),
        filter(isUpdated => isUpdated === true),
        first()
      ).subscribe(() => {

        this.cdr.detectChanges();
        this.updateSemesterStudyPath();
      });

      this.dialog.closeAll();
    }
  }

  // confirm dialog for finishing an empty semester
  confirmFinishingEmptySemester(semester: string) {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Semester ohne Module abschließen?',
      confirmationItem: 'dem Semesterabschluss ohne Module oder Platzhalter',
      confirmButtonLabel: 'Abschließen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.updateIsPastSemestersForAllPlans(semester);
        this.updateSemesterStudyPath(); // ensure study path is up to date
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  // get all plans from state and update their past semester property for the specific semester
  updateIsPastSemestersForAllPlans(semester: string) {
    this.store
      .select(getStudyPlans)
      .pipe(take(1))
      .subscribe((studyPlans) => {
        studyPlans.forEach((plan) => {
          if (Array.isArray(plan.semesterPlans)) {
            plan.semesterPlans.forEach((semesterPlan) => {
              if (semesterPlan.semester === semester) {
                this.store.dispatch(
                  SemesterPlanActions.updateIsPastSemester({
                    studyPlanId: plan._id,
                    semesterPlanId: semesterPlan._id,
                    isPast: true,
                  })
                );
              }
            });
          }
        });
        // refresh semesterStudyPath observable after updates
        this.updateSemesterStudyPath();
      });
    this.dialog.closeAll();
  }

  // helper for getting the module details and status for mhb modules
  // status and grade needs to be fetched extra (MongoDB) because is not saved with Module (MariaDB)
  private getModuleDetailsWithStatus(
    acronym: string,
    semesterPlan: SemesterPlan
  ): Observable<PathModule | null> {
    return forkJoin({
      details: forkJoin({ // fetch current AND old modules
        current: this.store.select(getModuleByAcronym(acronym)).pipe(take(1)),
        old: this.store.select(getOldModuleByAcronym(acronym)).pipe(take(1))
      }).pipe(
        map(({ current, old }) => current || old)
      ),
      status: this.store.select(getUserStudyPath).pipe(
        take(1),
        map((studyPath) => {
          const moduleInSemester = studyPath.completedModules.find(
            (mod) =>
              mod.acronym === acronym && mod.semester === semesterPlan.semester
          );
          return moduleInSemester?.status || 'open';
        })
      ),
      grade: this.store.select(getUserStudyPath).pipe(
        take(1),
        map((studyPath) => {
          const moduleInSemester = studyPath.completedModules.find(
            (mod) =>
              mod.acronym === acronym && mod.semester === semesterPlan.semester
          );
          return moduleInSemester?.grade || 0;
        })
      ),
      _id: this.store.select(getUserStudyPath).pipe(
        take(1),
        map((studyPath) => {
          const moduleInSemester = studyPath.completedModules.find(
            (mod) =>
              mod.acronym === acronym && mod.semester === semesterPlan.semester
          );
          return moduleInSemester?._id;
        })
      ),
    }).pipe(
      map(({ details, status, grade, _id }) => {
        if (!details) {
          return null;
        }
        return {
          _id,
          acronym: details.acronym,
          name: details.name,
          ects: details.ects,
          status: status,
          mgId: 'init', // set mgId to init to prevent false value due to preselect of one mgId instead of selection out of all possible mgIds
          semester: semesterPlan.semester,
          isUserGenerated: false,
          flexNowImported: false,
          grade
        };
      })
    );
  }

  // helper for appending status and grade to user-generated modules
  private appendStatusAndGradeToUserGeneratedModules(
    userGeneratedModules: UserGeneratedModule[], semester: string,
  ): Observable<PathModule[]> {
    return this.store.select(getUserStudyPath).pipe(
      take(1),
      map((studyPath) => {
        return userGeneratedModules.map((userGeneratedMod) => {
          const completedModule = studyPath.completedModules.find(
            (mod) => mod._id === userGeneratedMod._id
          );

          // setting name and acronym depending on fn module or placeholder fields

          let name;

          if (userGeneratedMod.flexNowImported) {
            name = completedModule?.name || userGeneratedMod.name || userGeneratedMod?.notes || '-'
          }
          else {
            name = userGeneratedMod?.notes || '-'
          }

          return {
            ...userGeneratedMod,
            name,
            semester,
            acronym: completedModule?.acronym || userGeneratedMod?.acronym || userGeneratedMod?.name,
            status: completedModule?.status || 'open',
            grade: completedModule?.grade || 0,
            isUserGenerated: true,
          };
        });
      })
    );
  }

  openEditStudyPlanDialog(studyPlanId: string, studyPlan: StudyPlan) {

    if (studyPlan && studyPlanId) { // edit existing study plan

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Studienplan bearbeiten',
          dialogContentId: 'add-study-plan-dialog',
          studyPlan: studyPlan,
        },
      });

      dialogRef.afterClosed().subscribe((name?: string) => {
        if (name) {
          studyPlan.name = name;
        }
        this.store
          .select(getCloseDialogMode)
          .subscribe((mode) => (this.closeMode = mode));
        if (this.closeMode === 'data') {
          console.log(studyPlanId, studyPlan)
          this.studyPlanService.updateStudyPlan(studyPlanId, studyPlan);
        } else {
          return;
        }
      });
    }
  }

  ngOnDestroy() {
    this.store.dispatch(StudyPlanActions.deselectStudyPlan());
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
