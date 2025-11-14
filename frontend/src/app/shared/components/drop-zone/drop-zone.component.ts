import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-drop-zone',
    templateUrl: './drop-zone.component.html',
    styleUrls: ['./drop-zone.component.scss'],
    standalone: false
})
export class DropZoneComponent {
  @Output() fileDropped = new EventEmitter<File>();
  uploadedFileName?: string;
  isFileOver = false;

  ngOnInit() {
    this.isFileOver = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileOver = true; // file over drop zone
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileOver = false; // file not over drop zone
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files[0]);
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFiles(file);
    }
  }

  private handleFiles(file: File): void {
    this.fileDropped.emit(file);
    this.uploadedFileName = file.name;
  }
}

