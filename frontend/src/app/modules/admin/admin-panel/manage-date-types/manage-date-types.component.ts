import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { DateType } from '../../../../../../../interfaces/academic-date';
import { AdminRestService } from '../../admin-rest.service';
import { AdminDialogComponent } from '../../dialogs/admin-dialog.component';
import { RestService } from 'src/app/rest.service';

@Component({
    selector: 'admin-manage-date-types',
    templateUrl: './manage-date-types.component.html',
    styleUrl: './manage-date-types.component.scss',
    standalone: false
})
export class ManageDateTypesComponent {
  displayedColumns: string[] = ['typeId', 'name', 'desc', 'actions'];
  dateTypes$: Observable<DateType[]>;
  dataSource: MatTableDataSource<DateType> = new MatTableDataSource<DateType>([]);
  dateTypeSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private adminRest: AdminRestService, public dialog: MatDialog, private rest: RestService) {}

  ngOnInit(): void {
      this.dateTypeSubscription = this.rest.getDateTypes().subscribe(types => {
        this.dataSource = new MatTableDataSource<DateType>(types);
      });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: 'Neuen Zeitraumtyp anlegen',
        dialogContentId: 'date-type-dialog',
      }
    });

    dialogRef.afterClosed().subscribe((result: {name: string, desc: string} | undefined) => {
      if(result && result.name && result.desc !== undefined) {  
        this.adminRest.addDateType(result.name, result.desc).subscribe(dateType => {
          this.dataSource.data.push(dateType)
          this.dataSource._updateChangeSubscription()
        })
      }
    });
  }

  openEditDialog(element: DateType) {
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: 'Zeitraumtyp bearbeiten',
        dialogContentId: 'date-type-dialog',
        dateType: element
      }
    });

    dialogRef.afterClosed().subscribe((result: DateType | undefined) => {
      if(result) {
        result = {
          ...result,
          typeId: element.typeId
        }
        this.adminRest.updateDateType(result).subscribe((dateType) => {
          const index = this.dataSource.data.findIndex((date) => date.typeId === dateType.typeId);
          if(index > -1) {
            this.dataSource.data[index] = dateType
            this.dataSource._updateChangeSubscription()
          }
        })
      }
    });
  }

  openDeleteDialog(element: DateType) {
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: 'Zeitraumtyp löschen',
        dialogContentId: 'delete-academic-date-dialog',
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'delete') {
        this.adminRest.deleteDateType(element.typeId).subscribe((dateType) => {
          const index = this.dataSource.data.findIndex((date) => date.typeId === dateType.typeId);
          if(index > -1) {
            this.dataSource.data.splice(index, 1)
            this.dataSource._updateChangeSubscription()
          }
        })
      }
    });
  }
}
