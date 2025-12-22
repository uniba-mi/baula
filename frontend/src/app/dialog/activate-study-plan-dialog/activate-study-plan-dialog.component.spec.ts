import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateStudyPlanDialogComponent } from './activate-study-plan-dialog.component';

describe('ActivateStudyPlanDialogComponent', () => {
  let component: ActivateStudyPlanDialogComponent;
  let fixture: ComponentFixture<ActivateStudyPlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivateStudyPlanDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivateStudyPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
