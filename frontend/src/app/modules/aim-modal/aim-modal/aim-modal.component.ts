import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CompAim, User } from '../../../../../../interfaces/user';
import { Standard } from '../../bilapp/interfaces/standard';
import { State } from 'src/app/reducers';
import { Store } from '@ngrx/store';
import { getAllStandards } from '../../bilapp/state/selectors/standard.selectors';
import { getUser } from 'src/app/selectors/user.selectors';
import { CompetenceAimsActions } from 'src/app/actions/user.actions';

@Component({
    selector: 'app-aim-modal',
    templateUrl: './aim-modal.component.html',
    styleUrls: ['./aim-modal.component.scss'],
    standalone: false
})
export class AimModalComponent {
  standards$: Observable<Standard[]>; // all standards, that are located in state
  user$: Observable<User>;
  competencAims: CompAim[];
  uId: string | undefined;

  constructor(
    private store: Store<State>
  ) {
    // load relevant data from store or api
    this.standards$ = this.store.select(getAllStandards);
    this.user$ = this.store.select(getUser);
    this.user$.subscribe(user => {
      this.uId = user._id ? user._id : undefined;
      this.competencAims = user.compAims ? user.compAims : [];
    })
  }

  // event gets triggered, when input changes in the child components, pdates the Aim-Array
  updateForm(aim: CompAim) {
    const index = this.competencAims.findIndex((el) => el.compId == aim.compId);
    // check if aim already exists
    if (index !== -1) {
      // update aim
      this.competencAims[index] = aim;
    } else {
      // aim doesn't exist, so push to array
      this.competencAims.push(aim);
    }
  }

  // function to save aims to database
  // TODO: test if update of user state is triggered via database or is needed separately
  saveCompetenceAims() {
    this.store.dispatch(CompetenceAimsActions.updateCompetenceAims({ aims: this.competencAims }))
  }
}
