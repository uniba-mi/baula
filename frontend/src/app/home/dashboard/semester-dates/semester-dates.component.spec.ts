import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterDatesComponent } from './semester-dates.component';

describe('SemesterDatesComponent', () => {
  let component: SemesterDatesComponent;
  let fixture: ComponentFixture<SemesterDatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SemesterDatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SemesterDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
