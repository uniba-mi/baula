import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-notification-dialog',
  standalone: false,
  templateUrl: './notification-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './notification-dialog.component.scss'
})
export class NotificationDialogComponent { 
  disableDialog: boolean = false;
}
