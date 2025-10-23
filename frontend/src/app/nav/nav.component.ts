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
import { Studyprogramme } from '../../../../interfaces/studyprogramme';
import { MStudyprogramme, User } from '../../../../interfaces/user';
import {
  getActiveStudyplanId,
  getStudyplans,
} from '../selectors/study-planning.selectors';
import { StudyplanActions } from '../actions/study-planning.actions';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    standalone: false
})
export class NavComponent implements OnInit, OnChanges {
  @Input() user: User;
  studyprogrammes$: Observable<Studyprogramme[]>;
  semesters$: Observable<Semester[]>;
  bilappAvailable: boolean = false;

  // save active study plan id and insert in URL
  id$: string;
  activeStudyplanId$: Observable<string>;
  selectedStudyplanId$: Observable<string>;
  isWIAIStudent: boolean = false;

  constructor(
    private store: Store,
  ) {
    this.activeStudyplanId$ = store.select(getActiveStudyplanId);
  }

  ngOnInit(): void {
    // loading active studyplan on reload
    this.store.select(getStudyplans).subscribe((studyplans) => {
      if (studyplans && studyplans.length > 0) {
        this.store.select(getActiveStudyplanId).subscribe((activeId) => {
          if (activeId !== '') {
            this.id$ = activeId;
          } else {
            this.store.dispatch(
              StudyplanActions.loadActiveStudyplan()
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
      this.bilappAvailable = this.checkStudyprogramme(this.user.sps);
      if (this.user.sps[0].faculty === 'WIAI') {
        this.isWIAIStudent = true;
      }
    }
  }

  checkStudyprogramme(sps: MStudyprogramme[]): boolean {
    for (let sp of sps) {
      // assumption that teacher education sps start with LA and if EWS part is referenced ends with EWS
      if (sp.spId.startsWith('LA') && sp.spId.endsWith('EWS')) {
        return true;
      }
    }
    return false;
  }
}
