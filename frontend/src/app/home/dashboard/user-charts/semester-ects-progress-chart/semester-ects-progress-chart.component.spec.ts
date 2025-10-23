import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterEctsProgressChartComponent } from './semester-ects-progress-chart.component';

describe('SemesterEctsProgressChartComponent', () => {
  let component: SemesterEctsProgressChartComponent;
  let fixture: ComponentFixture<SemesterEctsProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemesterEctsProgressChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SemesterEctsProgressChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
