import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { AdminRestService } from '../admin-rest.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { MatDialog } from '@angular/material/dialog';
import { AdminDialogComponent } from '../dialogs/admin-dialog.component';

@Component({
  selector: 'fn2dnd',
  templateUrl: './fn2xml-dnd.component.html',
  styleUrls: ['./fn2xml-dnd.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class Fn2xmlDndComponent implements OnInit {
  private rest = inject(AdminRestService);
  private snackbar = inject(SnackbarService);
  private dialog = inject(MatDialog);

  selectedSemester: string = '';

  ngOnInit(): void {}

  handleFileInput(event: Event | FileList) {
    let files: FileList;
    if (event instanceof Event) {
      const target = event.target as HTMLInputElement;
      files = target.files as FileList;
    } else {
      files = event;
    }

    // iteriere über files um mehrere Dateien gleichzeitig hochzuladen
    for (const file of Object.values(files)) {
      const fileReader = new FileReader();
      fileReader.readAsText(file, 'UTF-8');
      fileReader.onload = () => {
        // Hier würde dann der API Zugriff erfolgen!
        this.rest
          .postXmlMhbsToDatabase(fileReader.result as string)
          .subscribe((mes) => console.log(mes));
      };
      fileReader.onerror = (error) => {
        console.log(error);
      };
    }
  }

  selectSemester(semester: string) {
    this.selectedSemester = semester;
  }

  crawlFlexNow() {
    if (this.selectedSemester !== '') {
      this.dialog.open(AdminDialogComponent, {
        data: {
          dialogTitle: $localize `FlexNow Modulhandbuch Crawl gestartet...`,
          dialogContentId: 'univis-crawl-dialog',
          univisCrawl$: this.rest.crawlFlexNow(this.selectedSemester),
        },
        disableClose: true,
      });
    } else {
      this.snackbar.openSnackBar({
        type: AlertType.DANGER,
        message: $localize `Es wurde kein Semester ausgewählt!`,
      });
    }
  }
}
