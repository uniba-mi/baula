import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateStudyplanDialogComponent } from './activate-studyplan-dialog.component';

describe('ActivateStudyplanDialogComponent', () => {
  let component: ActivateStudyplanDialogComponent;
  let fixture: ComponentFixture<ActivateStudyplanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivateStudyplanDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivateStudyplanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
