import { Component, OnInit } from '@angular/core';
import { ExtendedJob } from '../../../../../../interfaces/job';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { getJobs } from 'src/app/selectors/user.selectors';
import { JobActions } from 'src/app/actions/user.actions';
import { PathModule } from '../../../../../../interfaces/studypath';
import { RecHelperService } from 'src/app/modules/recs/rec-helper.service';


@Component({
  selector: 'job-settings',
  standalone: false,
  templateUrl: './job-settings.component.html',
  styleUrl: './job-settings.component.scss',
})
export class JobSettingsComponent implements OnInit {
  studypathModules$: Observable<PathModule[]>;
  jobs$: Observable<ExtendedJob[] | undefined>;

  constructor(private dialog: MatDialog, private store: Store, private recHelper: RecHelperService) { }

  ngOnInit() {
    this.jobs$ = this.store.select(getJobs);
    this.studypathModules$ = this.recHelper.getPassedOrTakenModulesFromStudypath();
  }

  openAddJobDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      maxWidth: window.innerWidth < 1400 ? '90vw' : '50vw',
      data: {
        dialogTitle: 'Neuen Job anlegen',
        dialogContentId: 'edit-job'
      },
      disableClose: true,
    })

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if(result) {
        this.store.dispatch(JobActions.upsertJob({ job: result }));
      }
    })
  }
}
