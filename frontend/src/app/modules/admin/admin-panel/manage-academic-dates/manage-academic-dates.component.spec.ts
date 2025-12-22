import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAcademicDatesComponent } from './manage-academic-dates.component';

describe('ManageAcademicDatesComponent', () => {
  let component: ManageAcademicDatesComponent;
  let fixture: ComponentFixture<ManageAcademicDatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageAcademicDatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageAcademicDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
