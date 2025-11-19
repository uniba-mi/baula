import { Component, Input, OnInit } from '@angular/core';
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
  standalone: false
})
export class ModuleCardComponent implements OnInit {
  @Input() module: Module;
  @Input() structure: ExtendedModuleGroup[] | null;
  studyPath$: Observable<StudyPath>;
  openedWithSemesterSet: boolean = false;
  openedFromModuleOffer: boolean;
  modType: string = 'notPath';
  path: string;

  constructor(
    private store: Store<State>,
    private modService: ModService,
    private analytics: AnalyticsService
  ) { }

  ngOnInit(): void {
    this.studyPath$ = this.store.select(getUserStudyPath);
    if (this.structure) {
      const moduleGroup = this.structure.find(el => el.mgId === this.module.mgId);
      this.path = moduleGroup ? moduleGroup.path : '';
    }
  }

  selectModule(module: Module) {

    const moduleAbbr = this.module.acronym.trim();
    this.analytics.trackEvent('ModuleClick', { module: moduleAbbr });

    this.modService.selectModuleFromAcronymString(module.acronym, undefined, module.mgId);
  }

  setHoverModule() {
    this.store.dispatch(ModuleInteractionActions.setHoverModule({ module: this.module }))
  }

  unsetHoverModule() {
    this.store.dispatch(ModuleInteractionActions.unsetHoverModule())
  }

  openPlanningDialog() {
    // TODO: Develop planning functionality as soon as terms regarding planning are finally discussed
  }
}
