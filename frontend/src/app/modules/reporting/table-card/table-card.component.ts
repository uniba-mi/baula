import { Component, input, OnInit } from '@angular/core';
import { TableCardData } from '../reporting';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'reporting-table-card',
  imports: [
    MatCardModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.scss'
})
export class TableCardComponent implements OnInit {
  cardData = input.required<TableCardData>()
  tableData: any[] = [];
  pageSize = 5; // Standard-Seitengröße
  currentPage = 0; // Aktuelle Seite

  ngOnInit(): void {
    this.tableData = this.updateTableData(this.cardData().data)
  }

  onPageChange(event: PageEvent, data: any[]): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;

    this.tableData = this.updateTableData(data)
  }

  private updateTableData(data: any[]): any[] {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return data.slice(startIndex, endIndex);
  }
}
