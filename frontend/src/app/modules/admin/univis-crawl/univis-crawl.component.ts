import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { getSemesterList } from 'src/app/selectors/user.selectors';
import { Semester } from '../../../../../../interfaces/semester';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { MatDialog } from '@angular/material/dialog';
import { AdminRestService } from '../admin-rest.service';
import { AdminDialogComponent } from '../dialogs/admin-dialog.component';
import { Logmessage } from '../../../../../../interfaces/logs';

@Component({
    selector: 'admin-univis-crawl',
    templateUrl: './univis-crawl.component.html',
    styleUrls: ['./univis-crawl.component.scss'],
    standalone: false
})
export class UnivisCrawlComponent implements OnInit {
  semesters$: Observable<Semester[]>;
  selectedSemester: string = '';
  cronjobLogs$: Observable<Logmessage[]>;

  constructor(
    private store: Store<State>,
    private rest: AdminRestService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.semesters$ = this.store.select(getSemesterList);
    this.cronjobLogs$ = this.rest.getCronjobLog();
  }

  selectSemester(semester: string) {
    this.selectedSemester = semester;
  }

  startCrawling() {
    if (this.selectedSemester !== '') {
      this.dialog.open(AdminDialogComponent, {
        data: {
          dialogTitle: 'UnivIS Crawl gestartet...',
          dialogContentId: 'univis-crawl-dialog',
          univisCrawl$: this.rest.crawlUnivIS(this.selectedSemester),
        },
        disableClose: true,
      });
    } else {
      this.snackbar.openSnackBar({
        type: AlertType.DANGER,
        message: 'Es wurde kein Semester ausgewählt!',
      });
    }
  }
}
