import { Component, computed, effect, input, signal } from '@angular/core';
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
export class TableCardComponent {
  cardData = input.required<TableCardData>();

  pageSize = signal(5);
  currentPage = signal(0);

  tableData = computed(() => {
    const data = this.cardData().data;
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return data.slice(startIndex, endIndex);
  });

  constructor() {
    // jump back to the first page whenever the underlying data set changes
    // (e.g. switching the selected semester), otherwise the paginator could
    // point past the end of the new data and the table would look "stuck"
    effect(() => {
      this.cardData();
      this.currentPage.set(0);
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);
  }
}
