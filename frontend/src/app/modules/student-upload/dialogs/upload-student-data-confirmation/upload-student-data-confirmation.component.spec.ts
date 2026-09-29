import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadStudentDataConfirmationComponent } from './upload-student-data-confirmation.component';

describe('UploadStudentDataConfirmationComponent', () => {
  let component: UploadStudentDataConfirmationComponent;
  let fixture: ComponentFixture<UploadStudentDataConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadStudentDataConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadStudentDataConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
