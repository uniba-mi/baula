import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-evaluation-dialog',
  templateUrl: './evaluation-dialog.component.html',
  styleUrl: './evaluation-dialog.component.scss',
  standalone: false
})
export class EvaluationDialogComponent {

  @Input() content: any;

  constructor() { }
}
