import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadStudentDataDialogComponent } from './upload-student-data-dialog.component';

describe('UploadStudentDataDialogComponent', () => {
  let component: UploadStudentDataDialogComponent;
  let fixture: ComponentFixture<UploadStudentDataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadStudentDataDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadStudentDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
