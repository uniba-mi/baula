import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterPlanComponent } from './semester-plan.component';

describe('SemesterPlanComponent', () => {
  let component: SemesterPlanComponent;
  let fixture: ComponentFixture<SemesterPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemesterPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SemesterPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
