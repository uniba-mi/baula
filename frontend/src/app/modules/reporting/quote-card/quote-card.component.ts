import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { QuoteCardData } from '../reporting';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'reporting-quote-card',
  imports: [
    MatCardModule
  ],
  templateUrl: './quote-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './quote-card.component.scss'
})
export class QuoteCardComponent {
  cardData = input.required<QuoteCardData>();
}
