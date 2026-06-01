import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FeatureWish } from '../../../../../../../interfaces/feature-wish';
import { RestService } from 'src/app/rest.service';

@Component({
  selector: 'app-admin-single-feature-wish',
  standalone: false,
  templateUrl: './admin-single-feature-wish.component.html',
  styleUrl: './admin-single-feature-wish.component.scss',
})
export class AdminSingleFeatureWishComponent {
  @Input() deleteButton: boolean = false;
  @Input() approveButton: boolean = false;
  @Input() unapproveButton: boolean = false;

  @Input() wish!: FeatureWish;
  @Input() showLikes: boolean = false;

  @Output() delete = new EventEmitter<FeatureWish>();
  @Output() approve = new EventEmitter<FeatureWish>();
  @Output() unapprove = new EventEmitter<FeatureWish>();

  @Output() editTags = new EventEmitter();

  adminMessage: string = "";
  initialAdminMessage: string = "";
  adminMessageErrorMessage: string = "";

  tagToAdd: string = "";
  tagToAddErrorMessage: string = "";
  tagToAddSuccessMessage: string = "";

  constructor(private rest: RestService) {

  }

  ngOnInit() {
    this.adminMessage = this.wish.adminMessage || "";
    this.initialAdminMessage = this.adminMessage;
  }

  unapproveWish() {
    this.unapprove.emit(this.wish);
  }

  deleteWish() {
    this.delete.emit(this.wish);
  }

  approveWish() {
    this.approve.emit(this.wish);
  }

  updateAdminMessage() {
    this.rest.adminUpdateAdminMessage(this.wish._id, this.adminMessage).subscribe({
      next: (response) => {
        this.wish.adminMessage = this.adminMessage;
        this.initialAdminMessage = this.adminMessage;
        this.adminMessageErrorMessage = "";
      },
      error: (error) => {
        console.error('Error updating admin message for feature wish:', error);
        // TODO: Passt das error.error?.error? ??
        console.log(error.error?.error?.message);
        this.adminMessageErrorMessage = error.error?.error?.message || 'An error occurred while updating the admin message.';
      }
    });
  }

  removeTag(tagName: string) {
    this.rest.adminRemoveTag(this.wish._id, tagName).subscribe({
      next: (response) => {
        this.wish.tags = this.wish.tags?.filter(tag => tag !== tagName);
        this.tagToAddSuccessMessage = `Der Tag "${tagName}" wurde erfolgreich entfernt.`;
        this.tagToAddErrorMessage = "";
      },
      error: (error) => {
        console.error('Error removing tag from feature wish:', error);
        this.tagToAddErrorMessage = error.error?.error?.message || "Der Tag konnte nicht entfernt werden.";
        this.tagToAddSuccessMessage = "";
      }
    });
  }

  addTag() {
    this.rest.adminAddTag(this.wish._id, this.tagToAdd).subscribe({
      next: (response) => {
        this.wish.tags = [...(this.wish.tags || []), this.tagToAdd];
        this.tagToAdd = "";
        this.tagToAddSuccessMessage = "Tag erfolgreich hinzugefügt.";
        this.tagToAddErrorMessage = "";
      },
      error: (error) => {
        console.error('Error adding tag to feature wish:', error);
        this.tagToAddErrorMessage = error.error?.error?.message || "Der Tag konnte nicht hinzugefügt werden.";
        this.tagToAddSuccessMessage = "";
      }
    });
  }
}
