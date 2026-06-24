import { Directive, HostListener, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[appTooltip]',
  standalone: false,
})
export class TooltipDirective {
  private tooltip = inject(MatTooltip, { self: true });

  @HostListener('click')
  onClick(): void {
    this.tooltip.show();
  }
}
