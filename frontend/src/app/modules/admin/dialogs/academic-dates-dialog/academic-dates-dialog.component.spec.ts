import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicDatesDialogComponent } from './academic-dates-dialog.component';

describe('AcademicDatesDialogComponent', () => {
  let component: AcademicDatesDialogComponent;
  let fixture: ComponentFixture<AcademicDatesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AcademicDatesDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AcademicDatesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
