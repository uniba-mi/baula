import { Component } from '@angular/core';

@Component({
  selector: 'app-notification-dialog',
  standalone: false,
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.scss'
})
export class NotificationDialogComponent { 
  disableDialog: boolean = false;
}
