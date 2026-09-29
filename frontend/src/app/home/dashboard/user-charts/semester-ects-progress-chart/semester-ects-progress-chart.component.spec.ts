import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterEctsProgressChartComponent } from './semester-ects-progress-chart.component';
import { LineChartCardComponent } from 'src/app/modules/reporting/line-chart-card/line-chart-card.component';

describe('SemesterEctsProgressChartComponent', () => {
  let component: SemesterEctsProgressChartComponent;
  let fixture: ComponentFixture<SemesterEctsProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemesterEctsProgressChartComponent ],
      imports: [ LineChartCardComponent ]
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
