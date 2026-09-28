import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEctsProgressChartComponent } from './total-ects-progress-chart.component';
import { BarChartCardComponent } from 'src/app/modules/reporting/bar-chart-card/bar-chart-card.component';

describe('TotalEctsProgressChartComponent', () => {
  let component: TotalEctsProgressChartComponent;
  let fixture: ComponentFixture<TotalEctsProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalEctsProgressChartComponent ],
      imports: [ BarChartCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalEctsProgressChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
