import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-upload-data-privacy',
    templateUrl: './upload-data-privacy.component.html',
    styleUrl: './upload-data-privacy.component.scss',
    standalone: false
})
export class UploadDataPrivacyComponent {
    @Input() version: string;
}
