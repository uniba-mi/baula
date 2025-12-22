import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';

@Component({
    selector: 'app-aimed-ects-dialog',
    templateUrl: './aimed-ects-dialog.component.html',
    styleUrls: ['./aimed-ects-dialog.component.scss'],
    standalone: false
})
export class AimedEctsDialogComponent implements OnInit {
  @Input() aimedEcts: number;
  aimedEctsForm: FormGroup;

  constructor(private store: Store, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.aimedEctsForm = this.formBuilder.group({
      aimedEcts: [
        this.aimedEcts ? this.aimedEcts : '',
        {
          validators: [
            Validators.min(1),
            Validators.max(300),
            Validators.pattern("^[0-9]+$"),
            Validators.required,
          ],
        },
      ],
    });
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }
}
