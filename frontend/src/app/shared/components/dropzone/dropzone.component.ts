import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-dropzone',
    templateUrl: './dropzone.component.html',
    styleUrls: ['./dropzone.component.scss'],
    standalone: false
})
export class DropzoneComponent {
  @Output() fileDropped = new EventEmitter<File>();
  uploadedFileName?: string;
  isFileOver = false;

  ngOnInit() {
    this.isFileOver = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileOver = true; // file over dropzone
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileOver = false; // file not over dropzone
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

