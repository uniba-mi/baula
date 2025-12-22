import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import {
  getAllModules,
  getDistinctModules,
} from 'src/app/selectors/module-overview.selectors';
import { Module } from '../../../../../interfaces/module';
import { AlertType } from '../classes/alert';
import { SnackbarService } from './snackbar.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { ModuleInteractionActions } from 'src/app/actions/module-overview.actions';
import { UserGeneratedModule } from '../../../../../interfaces/user-generated-module';
import { PathModule } from '../../../../../interfaces/study-path';

@Injectable({
  providedIn: 'root',
})
export class ModService {
  modulesInState$: any;

  // for status updates everywhere without reloading
  private moduleAcronymSource = new BehaviorSubject<
    Module | PathModule | UserGeneratedModule | null
  >(null);
  currentAcronym$ = this.moduleAcronymSource.asObservable();

  constructor(
    private store: Store,
    private snackbar: SnackbarService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  selectModuleFromAcronymString(acronym: string, activeTab: string = 'details', mgId?: string) {
    // select module from state where acronym matches the given acronym
    this.modulesInState$ = this.store.select(getAllModules);

    // find module in modulesInState where acronym matches the given acronym
    this.modulesInState$.pipe(take(1)).subscribe((modules: Module[]) => {
      let module: Module | undefined;
      if (!mgId || mgId === 'init') {
        module = modules.find((mod: Module) => mod.acronym === acronym);
      } else {
        module = modules.find(
          (mod: Module) => mod.acronym === acronym && mod.mgId === mgId
        );
      }

      if (module) {
        if (this.router.url.startsWith('/app/modulkatalog')) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { id: module.mId, mgId: module.mgId },
          });
        } else {
          this.openDetailsDialog(module, activeTab)
        }
      } else {
        this.router.navigate([], {
          relativeTo: this.route,
        });
        this.snackbar.openSnackBar({
          type: AlertType.DANGER,
          message:
            'Kein passendes Modul gefunden. Informiere dich auf der Universitätsseite über das Modul, da es nicht in unserem Modulbestand vorliegt.',
        });
      }
    });
  }

  // retrieve modules based on acronyms
  public getFullModulesByAcronyms(acronyms: string[]): Observable<Module[]> {
    return this.store.pipe(
      select(getDistinctModules),
      map((modules) =>
        modules.filter((module) => acronyms.includes(module.acronym))
      )
    );
  }

  // pass activeTab if other tab than details should appear, e. g. 'feedback' for feedback tab
  // keep is used to check, if module should selected untrimmed or if mgId should be trimmed
  openDetailsDialog(module: Module, activeTab: string = 'details', keep?: boolean) {
    if (!keep) {
      const courses = module.mCourses;
      const extractedPreviousModules = module.extractedPrevModules;

      module = new Module(
        module.mId,
        module.version,
        module.acronym,
        module.name,
        module.content,
        module.skills,
        module.addInfo,
        module.priorKnowledge,
        module.ects,
        module.term,
        module.recTerm,
        module.duration,
        module.chair,
        module.respPerson ? module.respPerson : null,
        module.exams,
        module.prevModules,
        module.offerBegin,
        module.offerEnd,
        module.workload,
      );
      
      module.addCourses(courses);
      module.addExtractedPrevModules(extractedPreviousModules);
      module.addAllPriorModules([...module.extractedPrevModules, ...module.prevModules.map((mod: Module) => mod.acronym)]);
    }

    this.store.dispatch(ModuleInteractionActions.setSelectedModule({ module }));

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogContentId: 'module-details-dialog',
        selectedModule: module,
        activeTab,
      },
      enterAnimationDuration: 100,
      exitAnimationDuration: 100,
      minWidth: '80vw',
      minHeight: '80vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        this.router.navigate([], {
          relativeTo: this.route,
        });
      }

      if (result !== 'next') {
        this.store.dispatch(ModuleInteractionActions.unsetSelectedModule());
      }
    });
  }

  unsetSelectedModule() {
    this.store.dispatch(ModuleInteractionActions.unsetSelectedModule());
  }
}
