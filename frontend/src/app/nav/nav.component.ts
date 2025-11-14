import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Semester } from '../../../../interfaces/semester';
import { StudyProgramme } from '../../../../interfaces/study-programme';
import { MStudyProgramme, User } from '../../../../interfaces/user';
import {
  getActiveStudyPlanId,
  getStudyPlans,
} from '../selectors/study-planning.selectors';
import { StudyPlanActions } from '../actions/study-planning.actions';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    standalone: false
})
export class NavComponent implements OnInit, OnChanges {
  @Input() user: User;
  studyprogrammes$: Observable<StudyProgramme[]>;
  semesters$: Observable<Semester[]>;
  bilappAvailable: boolean = false;

  // save active study plan id and insert in URL
  id$: string;
  activeStudyPlanId$: Observable<string>;
  selectedStudyPlanId$: Observable<string>;
  isWIAIStudent: boolean = false;

  constructor(
    private store: Store,
  ) {
    this.activeStudyPlanId$ = store.select(getActiveStudyPlanId);
  }

  ngOnInit(): void {
    // loading active study plan on reload
    this.store.select(getStudyPlans).subscribe((studyPlans) => {
      if (studyPlans && studyPlans.length > 0) {
        this.store.select(getActiveStudyPlanId).subscribe((activeId) => {
          if (activeId !== '') {
            this.id$ = activeId;
          } else {
            this.store.dispatch(
              StudyPlanActions.loadActiveStudyPlan()
            );
          }
          if (!activeId) {
            this.id$ = 'notfound';
          }
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && this.user.sps && this.user.sps.length > 0) {
      this.bilappAvailable = this.checkForTeacherStudyprogramme(this.user.sps);
      this.isWIAIStudent = this.checkForWIAIStudyprogramme(this.user.sps);
    }
  }

  checkForTeacherStudyprogramme(sps: MStudyProgramme[]): boolean {
    for (let sp of sps) {
      // assumption that teacher education sps start with LA and if EWS part is referenced ends with EWS
      if (sp.spId.startsWith('LA') && sp.spId.endsWith('EWS')) {
        return true;
      }
    }
    return false;
  }

  checkForWIAIStudyprogramme(sps: MStudyProgramme[]): boolean {
    if (sps[0].faculty === 'WIAI') { // checking for first programme only
      return true;
    }
    return false;
  }

}
