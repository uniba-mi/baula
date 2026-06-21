import { Component, OnInit } from '@angular/core';
import { FeatureWish } from '../../../../../../interfaces/feature-wish';
import { RestService } from 'src/app/rest.service';

@Component({
  selector: 'app-admin-feature-wishes',
  standalone: false,
  templateUrl: './admin-feature-wishes.component.html',
  styleUrl: './admin-feature-wishes.component.scss',
})
export class AdminFeatureWishesComponent implements OnInit {
  unapprovedWishes: FeatureWish[] = [];
  approvedWishes: FeatureWish[] = [];

  editAdminMessageSuccessMessage: string = "";
  editAdminMessageErrorMessage: string = "";

  simpleView: boolean = false;


  constructor(private rest: RestService) {
  }

  ngOnInit() {
    this.rest.adminGetUnapprovedWishes().subscribe({
      next: (response) => {
        this.unapprovedWishes = response;
      },
      error: (error) => {
        console.error('Error retrieving unapproved feature wishes:', error);
      }
    });

    this.rest.getAllFeatureWishes().subscribe({
      next: (response) => {
        this.approvedWishes = response.filter(wish => wish.isAllowed);
      },
      error: (error) => {
        console.error('Error retrieving all feature wishes:', error);
      }
    });
  }

  approveWish(wish: FeatureWish) {
    const wishId = wish._id;
    this.rest.adminApproveWish(wishId).subscribe({
      next: (response) => {
        this.approvedWishes.push(this.unapprovedWishes.filter(wish => wish._id === wishId)[0]);
        this.unapprovedWishes = this.unapprovedWishes.filter(wish => wish._id !== wishId);
      },
      error: (error) => {
        console.error('Error approving feature wish:', error);
      }
    });
  }

  unapproveWish(wish: FeatureWish) {
    const wishId = wish._id;
    this.rest.adminUnapproveWish(wishId).subscribe({
      next: (response) => {
        this.unapprovedWishes.push(this.approvedWishes.filter(wish => wish._id === wishId)[0]);
        this.approvedWishes = this.approvedWishes.filter(wish => wish._id !== wishId);
      },
      error: (error) => {
        console.error('Error unapproving feature wish:', error);
      }
    });
  }

  deleteWish(wish: FeatureWish) {
    const wishId = wish._id;
    this.rest.adminDeleteWish(wishId).subscribe({
      next: (response) => {
        this.unapprovedWishes = this.unapprovedWishes.filter(wish => wish._id !== wishId);
        this.approvedWishes = this.approvedWishes.filter(wish => wish._id !== wishId);
      },
      error: (error) => {
        console.error('Error deleting feature wish:', error);
      }
    });
  }
}
