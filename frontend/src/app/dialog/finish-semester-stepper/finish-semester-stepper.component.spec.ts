import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishSemesterStepperComponent } from './finish-semester-stepper.component';

describe('FinishSemesterStepperComponent', () => {
  let component: FinishSemesterStepperComponent;
  let fixture: ComponentFixture<FinishSemesterStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FinishSemesterStepperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinishSemesterStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
