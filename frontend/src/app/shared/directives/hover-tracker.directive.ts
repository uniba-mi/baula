import { Directive, HostListener } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';

@Directive({
  selector: '[appHoverTracker]',
  standalone: false,
})
export class HoverTrackerDirective {
  private isHovered = false;

  constructor(private analytics: AnalyticsService) { }

  // used to track any hover effects globally
  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    if (!this.isHovered) {
      this.isHovered = true;
      const targetElement = event.currentTarget as HTMLElement;
      const elementLabel = targetElement.id || targetElement.className || targetElement.tagName;

      this.analytics.trackEvent('hover', {
        action: 'Enter',
        element: elementLabel
      });

    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isHovered = false;
  }
}
