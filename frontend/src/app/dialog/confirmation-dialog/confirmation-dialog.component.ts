import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  dialogTitle?: string;
  actionType?: string; // distinguishing confirmation actions (delete, add, update)
  confirmationItem?: string; // item being confirmed (e.g., study plan, module)
  warningMessage?: string; // warning message (for irreversible actions)
  confirmButtonLabel: string;
  cancelButtonLabel: string;
  confirmButtonClass?: string; // CSS class for button styling (e.g., btn btn-danger for delete)
  callbackMethod: () => void; // function to execute when the action is confirmed
}

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    standalone: false
})
export class ConfirmationDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void { }

  handleDialogSubmit() {
    this.data.callbackMethod();
  }
}
