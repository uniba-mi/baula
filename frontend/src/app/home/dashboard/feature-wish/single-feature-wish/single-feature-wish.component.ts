import { Component, Input } from '@angular/core';
import { FeatureWish } from '../../../../../../../interfaces/feature-wish';
import { RestService } from 'src/app/rest.service';

@Component({
  selector: 'app-single-feature-wish',
  standalone: false,
  templateUrl: './single-feature-wish.component.html',
  styleUrl: './single-feature-wish.component.scss',
})
export class SingleFeatureWishComponent {
  @Input() wish: FeatureWish;
  @Input() rank?: number;
  @Input() withDescription: boolean = false;
  @Input() withLikeButton: boolean = true;

  @Input() withDeleteButton: boolean = false;
  @Input() deleteFunction?: (wish: FeatureWish) => void;

  hasLikedThisWish: boolean = false;
  isUsersWish: boolean = false;

  constructor(private rest: RestService) {
    
  }

  ngOnInit() {
    this.rest.hasLikedFeatureWish(this.wish._id).subscribe({
      next: (response) => {
        this.hasLikedThisWish = response.hasLiked;
      }
    });

    this.rest.isUsersWish(this.wish._id).subscribe({
      next: (response) => {
        this.isUsersWish = response.isUsersWish;
      }
    });
  }

  likeOrUnlikeWish() {
    if (this.hasLikedThisWish) {
      this.rest.unlikeFeatureWish(this.wish._id).subscribe({
        next: (response) => {
          this.wish.likes = (this.wish.likes || 1) - 1;
          this.hasLikedThisWish = false;
        }
      });
    } else {
      this.rest.likeFeatureWish(this.wish._id).subscribe({
        next: (response) => {
          this.wish.likes = (this.wish.likes || 0) + 1;
          this.hasLikedThisWish = true;
        }
      });
    }
  }
}
