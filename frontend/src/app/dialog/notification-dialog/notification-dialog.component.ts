import { Component } from '@angular/core';

@Component({
  selector: 'app-notification-dialog',
  standalone: false,
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.scss'
})
export class NotificationDialogComponent { 
  disableDialog: boolean = false;

  openLink() {
    window.open('https://vc.uni-bamberg.de/mod/feedback/view.php?id=1959319', '_blank');
  }
}
