import { Component, Input, OnInit } from '@angular/core';
import { Studyplan } from '../../../../../interfaces/studyplan';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-activate-studyplan-dialog',
    templateUrl: './activate-studyplan-dialog.component.html',
    styleUrl: './activate-studyplan-dialog.component.scss',
    standalone: false
})
export class ActivateStudyplanDialogComponent implements OnInit {
  @Input() studyplans?: Studyplan[];
  @Input() activePlan: Studyplan;
  @Input() newPlanId: string | undefined;
  newPlanIdForm = new FormControl('')
  keepCurrentSemester = false;

  ngOnInit() {
    // if newPlanId is set, then user has already selected a studyplan to activate
    if(this.newPlanId) {
      this.newPlanIdForm.patchValue(this.newPlanId)
    }
    // set newPlanId if studyplans array consists only of one entry
    if(this.studyplans && this.studyplans.length === 1) {
      this.newPlanIdForm.patchValue(this.studyplans[0]._id)
    }
  }
}
