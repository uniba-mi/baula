import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadStudentDataStepperComponent } from './upload-student-data-stepper.component';

describe('UploadStudentDataStepperComponent', () => {
  let component: UploadStudentDataStepperComponent;
  let fixture: ComponentFixture<UploadStudentDataStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadStudentDataStepperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadStudentDataStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
