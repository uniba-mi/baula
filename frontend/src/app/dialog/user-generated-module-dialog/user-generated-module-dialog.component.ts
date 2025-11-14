import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { UserGeneratedModule, UserGeneratedModuleTemplate } from '../../../../../interfaces/user-generated-module';

@Component({
    selector: 'app-user-generated-module-dialog',
    templateUrl: './user-generated-module-dialog.component.html',
    styleUrls: ['./user-generated-module-dialog.component.scss'],
    standalone: false
})
export class UserGeneratedModuleDialogComponent implements OnInit {
  @Input() module: UserGeneratedModuleTemplate;
  moduleForm: FormGroup;

  constructor(private store: Store, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    // create or fill form fields
    this.moduleForm = this.formBuilder.group({
      name: [
        this.module.name ? this.module.name : '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(50),
            Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/),
          ],
          updateOn: 'blur',
        },
      ],
      notes: [
        this.module.notes ? this.module.notes : '',
        { validators: [Validators.maxLength(1000)] },
      ],
      ects: [
        this.module.ects ? this.module.ects : '',
        {
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.max(30),
            Validators.pattern('^[0-9]*$'),
          ],
        },
      ],
      flexNowImported: [this.module.flexNowImported],
    });
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }
}
