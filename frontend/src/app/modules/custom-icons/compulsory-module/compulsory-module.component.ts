import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'ci-compulsory-module',
    templateUrl: './compulsory-module.component.html',
    styleUrl: './compulsory-module.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CompulsoryModuleComponent {

}
