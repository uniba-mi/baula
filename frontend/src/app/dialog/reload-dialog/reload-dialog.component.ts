import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-reload-dialog',
  standalone: false,
  
  templateUrl: './reload-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './reload-dialog.component.scss'
})
export class ReloadDialogComponent {

}
