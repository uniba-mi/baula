import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { State } from 'src/app/reducers';
import { Standard } from '../../../interfaces/standard';
import { selectStandard } from '../../../state/actions/standard.actions';
import { getAllStandards, getSelectedStandard } from '../../../state/selectors/standard.selectors';

@Component({
    selector: 'app-standard',
    templateUrl: './standard.component.html',
    styleUrls: ['./standard.component.scss'],
    standalone: false
})
export class StandardComponent implements OnInit {
  // variables for statemanagement
  standards$: Observable<Standard[]>;
  selectedStandard$: Observable<Standard | undefined>;

  constructor(public dialog: MatDialog,
              private store: Store<State>) { }

  ngOnInit() {
    // load values from Store
    this.standards$ = this.store.pipe(select(getAllStandards));
    this.selectedStandard$ = this.store.pipe(select(getSelectedStandard));
    this.selectedStandard$.subscribe(standard => {
      if(standard) {
        this.selectStandard(standard)
      }
    })
  }

  selectStandard(standardInput: Standard) {
    this.store.dispatch(selectStandard( { standard: standardInput} ));
  }

  checkSelectedStandard(currentStandard: Standard, selectedStandard: Standard) {
    if ( currentStandard.stId === selectedStandard.stId ) {
      return true;
    } else {
      return false;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  openDialog(standard: Standard) {
    this.dialog.open(DialogComponent, {
      data: {
        dialogTitel: `Informationen zum ${standard.stId} Standard`,
        dialogContentId: 'standard-dialog',
        standard: standard,
      }
    })
  }
}
