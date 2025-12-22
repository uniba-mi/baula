import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyPlanDialogComponent } from './study-plan-dialog.component';

describe('StudyPlanDialogComponent', () => {
  let component: StudyPlanDialogComponent;
  let fixture: ComponentFixture<StudyPlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyPlanDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
