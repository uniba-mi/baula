import { Component } from '@angular/core';
import { RestService } from 'src/app/rest.service';
import { FeatureWish } from '../../../../../../interfaces/feature-wish';

@Component({
  selector: 'app-feature-wish',
  standalone: false,
  templateUrl: './feature-wish.component.html',
  styleUrl: './feature-wish.component.scss',
})
export class FeatureWishComponent {
  title = '';
  description = '';
  selectedIcon: string | undefined = undefined;

  errorMessage = '';
  successMessage = '';

  allWishesErrorMessage = '';

  constructor(private rest: RestService,) {

  }

  topFeaturesWished: FeatureWish[] = [];
  allFeaturesWished: FeatureWish[] = [];


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
  }

  submitFeatureWish() {
    this.rest.sendFeatureWish(this.title, this.description, this.selectedIcon).subscribe({
      next: (response) => {
        console.log('Feature wish successfully sent:', response);

        this.title = '';
        this.description = '';
        this.selectedIcon = undefined;
        this.successMessage = 'Der Feature-Wunsch wurde erfolgreich gesendet! ' +
          'Dieser wird nun geprüft und bei Genehmigung in der Liste der Wünsche erscheinen. \n' +
          'Vielen Dank für dein Feedback!';
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error sending feature wish:', error.error.error.message);
        this.errorMessage = error.error?.error?.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
        this.successMessage = '';
      }
    });
  }
  
}
