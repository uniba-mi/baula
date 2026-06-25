import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { StudyPlanTemplate } from '@interfaces/study-plan';

@Component({
  selector: 'app-study-plan-dialog',
  templateUrl: './study-plan-dialog.component.html',
  styleUrls: ['./study-plan-dialog.component.scss'],
  standalone: false,
})
export class StudyPlanDialogComponent implements OnInit {
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);

  @Input() studyPlan: StudyPlanTemplate;
  studyPlanForm: FormGroup;

  ngOnInit(): void {
    this.studyPlanForm = this.formBuilder.group({
      name: [
        this.studyPlan.name ? this.studyPlan.name : '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(50),
            Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/),
          ],
        },
      ],
    });
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }
}
