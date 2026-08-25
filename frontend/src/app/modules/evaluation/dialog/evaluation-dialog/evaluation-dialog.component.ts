import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-evaluation-dialog',
  templateUrl: './evaluation-dialog.component.html',
  styleUrl: './evaluation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class EvaluationDialogComponent {

  @Input() content: any;

  constructor() { }
}
