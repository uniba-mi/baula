import { Component, Input, OnInit } from '@angular/core';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-activate-study-plan-dialog',
    templateUrl: './activate-study-plan-dialog.component.html',
    styleUrl: './activate-study-plan-dialog.component.scss',
    standalone: false
})
export class ActivateStudyPlanDialogComponent implements OnInit {
  @Input() studyPlans?: StudyPlan[];
  @Input() activePlan: StudyPlan;
  @Input() newPlanId: string | undefined;
  newPlanIdForm = new FormControl('')
  keepCurrentSemester = false;

  ngOnInit() {
    // if newPlanId is set, then user has already selected a study plan to activate
    if(this.newPlanId) {
      this.newPlanIdForm.patchValue(this.newPlanId)
    }
    // set newPlanId if study plans array consists only of one entry
    if(this.studyPlans && this.studyPlans.length === 1) {
      this.newPlanIdForm.patchValue(this.studyPlans[0]._id)
    }
  }
}
