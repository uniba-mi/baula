import { Component, Input, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { getUserStudyPath } from 'src/app/selectors/user.selectors';
import { Module } from '../../../../../../interfaces/module';
import { StudyPath } from '../../../../../../interfaces/study-path';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { ModuleInteractionActions } from 'src/app/actions/module-overview.actions';
import { ModService } from 'src/app/shared/services/module.service';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';

@Component({
  selector: 'app-module-card',
  templateUrl: './module-card.component.html',
  styleUrls: ['./module-card.component.scss'],
  standalone: false,
})
export class ModuleCardComponent implements OnInit {
  private store = inject<Store<State>>(Store);
  private modService = inject(ModService);
  private analytics = inject(AnalyticsService);

  @Input() module: Module;
  @Input() structure: ExtendedModuleGroup[] | null;
  studyPath$: Observable<StudyPath>;
  openedWithSemesterSet: boolean = false;
  openedFromModuleOffer: boolean;
  modType: string = 'notPath';
  path: string;

  ngOnInit(): void {
    this.studyPath$ = this.store.select(getUserStudyPath);
    if (this.structure) {
      const moduleGroup = this.structure.find(
        (el) => el.mgId === this.module.mgId,
      );
      this.path = moduleGroup ? moduleGroup.path : '';
    }
  }

  selectModule(module: Module) {
    if (!this.module.notExistingModule) {
      const moduleAbbr = this.module.acronym.trim();
      this.analytics.trackEvent('ModuleClick', { module: moduleAbbr });

      this.modService.selectModuleFromAcronymString(
        module.acronym,
        undefined,
        true,
        module.mgId,
      );
    }
  }

  setHoverModule() {
    if (!this.module.notExistingModule) {
      this.store.dispatch(
        ModuleInteractionActions.setHoverModule({ module: this.module }),
      );
    }
  }

  unsetHoverModule() {
    if (!this.module.notExistingModule) {
      this.store.dispatch(ModuleInteractionActions.unsetHoverModule());
    }
  }

  openPlanningDialog() {
    // TODO: Develop planning functionality as soon as terms regarding planning are finally discussed
  }
}
