import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalModuleProgressChartComponent } from './total-module-progress-chart.component';
import { BarChartCardComponent } from 'src/app/modules/reporting/bar-chart-card/bar-chart-card.component';

describe('TotalModuleProgressChartComponent', () => {
  let component: TotalModuleProgressChartComponent;
  let fixture: ComponentFixture<TotalModuleProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalModuleProgressChartComponent ],
      imports: [ BarChartCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalModuleProgressChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
