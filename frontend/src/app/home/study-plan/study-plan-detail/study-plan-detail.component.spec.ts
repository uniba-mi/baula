import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyPlanDetailComponent } from './study-plan-detail.component';

describe('StudyPlanDetailComponent', () => {
  let component: StudyPlanDetailComponent;
  let fixture: ComponentFixture<StudyPlanDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyPlanDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyPlanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
