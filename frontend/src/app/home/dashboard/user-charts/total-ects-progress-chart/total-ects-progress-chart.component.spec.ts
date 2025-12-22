import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEctsProgressChartComponent } from './total-ects-progress-chart.component';

describe('TotalEctsProgressChartComponent', () => {
  let component: TotalEctsProgressChartComponent;
  let fixture: ComponentFixture<TotalEctsProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalEctsProgressChartComponent ]
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
