import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-loading',
  standalone: false,
  templateUrl: './loading.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  data = inject<{ message: string }>(MAT_SNACK_BAR_DATA);
}
