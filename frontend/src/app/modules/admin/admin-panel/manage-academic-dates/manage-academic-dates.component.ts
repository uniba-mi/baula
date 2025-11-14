import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AdminRestService } from '../../admin-rest.service';
import { Observable, Subscription } from 'rxjs';
import { AcademicDate, AcademicDateTemplate } from '../../../../../../../interfaces/academic-date';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { AdminDialogComponent } from '../../dialogs/admin-dialog.component';
import { formatDate } from '@angular/common';

@Component({
    selector: 'admin-manage-academic-dates',
    templateUrl: './manage-academic-dates.component.html',
    styleUrl: './manage-academic-dates.component.scss',
    standalone: false
})
export class ManageAcademicDatesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'startdate', 'enddate', 'starttime', 'endtime', 'desc', 'semester', 'typeId', 'actions'];
  academicDates$: Observable<AcademicDate[]>;
  dataSource: MatTableDataSource<AcademicDate> = new MatTableDataSource<AcademicDate>([]);
  academicDatesSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private rest: AdminRestService, public dialog: MatDialog) {}

  ngOnInit(): void {
      this.academicDatesSubscription = this.rest.getAllAcademicDates().subscribe(dates => {
        this.dataSource = new MatTableDataSource<AcademicDate>(dates);
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: 'Neuen Zeitraum anlegen',
        dialogContentId: 'academic-date-dialog',
      }
    });

    dialogRef.afterClosed().subscribe((result: AcademicDateTemplate | undefined) => {
      if(result) {
        result = {
          ...result,
          startdate: formatDate(result.startdate, 'YYYY-MM-dd', 'en'),
          enddate: formatDate(result.enddate, 'YYYY-MM-dd', 'en'),
        }
  
        this.rest.addAcademicDate(result).subscribe((result) => {
          this.dataSource.data.push(result)
          this.dataSource = new MatTableDataSource<AcademicDate>(this.dataSource.data);
        })
      }
    });
  }

  openEditDialog(element: AcademicDate) {
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: 'Zeitraum bearbeiten',
        dialogContentId: 'academic-date-dialog',
        academicDate: element
      }
    });

    dialogRef.afterClosed().subscribe((result: AcademicDate | undefined) => {
      if(result) {
        result = {
          ...result,
          id: element.id,
          startdate: formatDate(result.startdate, 'YYYY-MM-dd', 'en'),
          enddate: formatDate(result.enddate, 'YYYY-MM-dd', 'en'),
        }

        this.rest.updateAcademicDate(result).subscribe((academicDate) => {
          const index = this.dataSource.data.findIndex((date) => date.id === academicDate.id);
          if(index > -1) {
            this.dataSource.data[index] = academicDate
            this.dataSource = new MatTableDataSource<AcademicDate>(this.dataSource.data);
          }
        })
      }
    });
  }

  openDeleteDialog(element: AcademicDate) {
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: 'Zeitraum löschen',
        dialogContentId: 'delete-academic-date-dialog',
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'delete') {
        this.rest.deleteAcademicDate(element.id).subscribe((academicDate) => {
          const index = this.dataSource.data.findIndex((date) => date.id === academicDate.id);
          if(index > -1) {
            this.dataSource.data.splice(index, 1)
            this.dataSource = new MatTableDataSource<AcademicDate>(this.dataSource.data);
          }
        })
      }
    });
  }
}
