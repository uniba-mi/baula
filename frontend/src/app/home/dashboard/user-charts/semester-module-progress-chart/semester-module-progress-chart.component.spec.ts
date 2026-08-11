import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterModuleProgressChartComponent } from './semester-module-progress-chart.component';
import { BarChartCardComponent } from 'src/app/modules/reporting/bar-chart-card/bar-chart-card.component';

describe('SemesterModuleProgressChartComponent', () => {
  let component: SemesterModuleProgressChartComponent;
  let fixture: ComponentFixture<SemesterModuleProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemesterModuleProgressChartComponent ],
      imports: [ BarChartCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SemesterModuleProgressChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
