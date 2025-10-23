import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyPlanSemesterComponent } from './study-plan-semester.component';

describe('StudyPlanSemesterComponent', () => {
  let component: StudyPlanSemesterComponent;
  let fixture: ComponentFixture<StudyPlanSemesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyPlanSemesterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyPlanSemesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
