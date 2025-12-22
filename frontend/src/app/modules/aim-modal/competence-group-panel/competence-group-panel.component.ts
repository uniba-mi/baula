import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Competence } from '../../../../../../interfaces/competence';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { CompAim } from '../../../../../../interfaces/user';
import { State } from 'src/app/reducers';
import { Store } from '@ngrx/store';
import { getUserAims } from 'src/app/selectors/user.selectors';

@Component({
    selector: 'app-competence-group-panel',
    templateUrl: './competence-group-panel.component.html',
    styleUrls: ['./competence-group-panel.component.scss'],
    standalone: false
})
export class CompetenceGroupPanelComponent implements OnInit {
  @Input() cg: Competence; // current competence group
  @Input() competences$: Observable<Competence[]>; // competences from parent
  @Output() updateCompetenceGroup = new EventEmitter<CompAim>()
  cgFormControl = new FormControl(0)
  compAim: CompAim;

  constructor(private store: Store<State>,) {}

  ngOnInit(): void { 
    // check if current cg has aim and patch value of this aim into form
    this.store.select(getUserAims).subscribe(aims => {
      if(aims) {
        const aim = aims.find(el => el.compId == this.cg.compId);
        if(aim) {
          this.compAim = aim;
          this.cgFormControl.patchValue(aim.aim)
        }
      }
    })
  }

  updateAim(value: string) {
    const newValue = Number.parseFloat(value);
    if(!Number.isNaN(newValue)) {
      this.cgFormControl.setValue(newValue);
      this.compAim = {
        compId: this.cg.compId,
        standard: this.cg.stId,
        aim: newValue
      }
      this.updateCompetenceGroup.emit(this.compAim)
    }
  }
}
