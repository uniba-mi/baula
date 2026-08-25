import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RestService } from 'src/app/rest.service';
import { FeatureWish } from '../../../../../../interfaces/feature-wish';

@Component({
  selector: 'app-feature-wish',
  standalone: false,
  templateUrl: './feature-wish.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './feature-wish.component.scss',
})
export class FeatureWishComponent {
  title = '';
  description = '';
  selectedIcon: string | undefined = undefined;

  errorMessage = '';
  successMessage = '';

  allWishesErrorMessage = '';

  usersUnapprovedWishesErrorMessage = '';

  constructor(private rest: RestService,) {

  }

  topFeaturesWished: FeatureWish[] = [];
  allFeaturesWished: FeatureWish[] = [];
  usersUnapprovedWishes: FeatureWish[] = [];


  ngOnInit() {
    // Get current top wishes
    this.rest.getTopFeatureWishes().subscribe({
      next: (response) => {
        response.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        this.topFeaturesWished = response;
      },
      error: (error) => {
        console.error('Error retrieving top feature wishes:', error);
      }
    });

    // Get all wishes
    this.rest.getAllFeatureWishes().subscribe({
      next: (response) => {
        response.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        this.allFeaturesWished = response;
      },
      error: (error) => {
        this.allWishesErrorMessage = error.error?.error?.message || 'Fehler beim Abrufen aller Feature-Wünsche. Bitte versuche es später erneut.';
      }
    });

    // Get all unapproved wishes of user
    this.rest.getUsersUnapprovedWishes().subscribe({
      next: (response) => {
        this.usersUnapprovedWishes = response;
      },
      error: (error) => {
        this.usersUnapprovedWishesErrorMessage = error.error?.error?.message || 'Fehler beim Abrufen deiner ungenehmigten Feature-Wünsche. Bitte versuche es später erneut.';
        console.error('Error retrieving user\'s unapproved feature wishes:', error);
      }
    });
  }

  submitFeatureWish() {
    this.rest.sendFeatureWish(this.title, this.description, this.selectedIcon).subscribe({
      next: (response) => {
        this.title = '';
        this.description = '';
        this.selectedIcon = undefined;
        this.successMessage = 'Dein Feature-Wunsch wurde erfolgreich eingereicht! ' +
          'Dieser wird nun geprüft und bei Genehmigung in der Liste der Wünsche erscheinen. \n' +
          'Vielen Dank für dein Feedback!';
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error sending feature wish:', error);
        console.error('Error sending feature wish:', error.error?.error?.message);
        this.errorMessage = error.error?.error?.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
        this.successMessage = '';
      }
    });
  }

  deleteUsersUnapprovedWish = (wish: FeatureWish) => {
    this.rest.deleteUsersUnapprovedWish(wish._id).subscribe({
      next: (response) => {
        this.usersUnapprovedWishes = this.usersUnapprovedWishes.filter(w => w._id !== wish._id);
      },
      error: (error) => {
        this.usersUnapprovedWishesErrorMessage = error.error?.error?.message || 'Fehler beim Löschen deines ungenehmigten Feature-Wunsches. Bitte versuche es später erneut.';
      }
    });
  }
  
}
