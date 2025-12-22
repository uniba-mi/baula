import { Component, Input, OnInit } from '@angular/core';
import { ExtendedJob, Job } from '../../../../../../../interfaces/job';
import { MatDialog } from '@angular/material/dialog';
import { ModService } from 'src/app/shared/services/module.service';
import { Store } from '@ngrx/store';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Observable, take } from 'rxjs';
import { JobActions } from 'src/app/actions/user.actions';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { PathModule } from '../../../../../../../interfaces/study-path';
import { Module } from '../../../../../../../interfaces/module';

@Component({
  selector: 'app-job-card',
  standalone: false,
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss',
})
export class JobCardComponent implements OnInit {
  @Input() job: ExtendedJob | undefined;
  @Input() studyPathModules: PathModule[] | null;
  recModules$: Observable<Module[]> | undefined;

  constructor(
    private dialog: MatDialog,
    private modService: ModService,
    private store: Store
  ) {}

  ngOnInit(): void {
    if (this.job && this.job.recModules && this.studyPathModules) {
      const acronyms = this.studyPathModules.map((el) => el.acronym);
      this.recModules$ = this.modService.getFullModulesByAcronyms(
        this.job.recModules
          .filter((module) => !acronyms.includes(module.acronym))
          .map((module) => module.acronym)
      );
    }
  }

  editJob(job: Job) {
    const dialogRef = this.dialog.open(DialogComponent, {
      maxWidth: window.innerWidth < 1400 ? '90vw' : '50vw',
      data: {
        dialogTitle: 'Job bearbeiten',
        dialogContentId: 'edit-job',
        job,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        const job = result && '_id' in result ? (result as Job) : undefined;
        if (job) {
          this.store.dispatch(JobActions.upsertJob({ job: job, id: job._id }));
        }
      });
  }

  openDeleteConfirmationDialog(job: Job) {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Jobanzeige löschen?',
      actionType: 'delete',
      confirmationItem: `die Jobanzeige "${job.title}"`,
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.deleteJob(job);
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  private deleteJob(job: Job) {
    this.store.dispatch(JobActions.deleteJob({ jobId: job._id }));
    this.dialog.closeAll();
  }

  openModule(acronym: string) {
    this.modService.selectModuleFromAcronymString(acronym);
  }
}
