import { Directive, HostListener, Self } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
    selector: '[appTooltip]',
    standalone: false
})
export class TooltipDirective {

    constructor(@Self() private tooltip: MatTooltip) { }

    @HostListener('click')
    onClick(): void {
        this.tooltip.show();
    }
}