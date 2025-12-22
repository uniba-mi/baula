import { Component, Input, SimpleChanges } from '@angular/core';
import { DialogComponent } from '../../dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { Module } from '../../../../../../interfaces/module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModuleFeedback } from '../../../../../../interfaces/user';
import { Store } from '@ngrx/store';
import { UserActions } from 'src/app/actions/user.actions';

@Component({
  selector: 'app-module-feedback',
  templateUrl: './module-feedback.component.html',
  styleUrl: './module-feedback.component.scss',
  standalone: false,
})
export class ModuleFeedbackComponent {
  @Input() selectedModule: Module;
  @Input() dialog: MatDialogRef<DialogComponent>;
  @Input() feedback: ModuleFeedback | null;

  feedbackForm!: FormGroup;

  questions = [
    { id: 'similarmods', label: 'Möchtest du inhaltlich ähnliche Module belegen?' },
    { id: 'similarchair', label: 'Möchtest du weitere Module dieses oder eines fachlich verwandten Lehrstuhls belegen?' },
    { id: 'priorknowledge', label: 'Sind die im Modul angegebenen Vorkenntnisse in vollem Umfang nötig?' },
    { id: 'contentmatch', label: 'Entsprechen die gelernten Inhalte nach deiner Einschätzung der Modulbeschreibung?' },
  ];

  constructor(private fb: FormBuilder, private store: Store) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.feedback) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    this.feedbackForm = this.fb.group({
      similarmods: [this.feedback?.similarmods || null],
      similarchair: [this.feedback?.similarchair || null],
      priorknowledge: [this.feedback?.priorknowledge || null],
      contentmatch: [this.feedback?.contentmatch || null],
    });
  }

  submitFeedback(): void {
    if (this.feedbackForm.valid) {
      const feedback: ModuleFeedback = {
        acronym: this.selectedModule.acronym,
        similarmods: this.feedbackForm.value.similarmods,
        similarchair: this.feedbackForm.value.similarchair,
        priorknowledge: this.feedbackForm.value.priorknowledge,
        contentmatch: this.feedbackForm.value.contentmatch,
      };

      this.store.dispatch(UserActions.updateModuleFeedback({ moduleFeedback: feedback }));
    }
  }
}