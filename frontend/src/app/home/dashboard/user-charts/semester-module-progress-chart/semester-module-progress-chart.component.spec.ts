import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterModuleProgressChartComponent } from './semester-module-progress-chart.component';

describe('SemesterModuleProgressChartComponent', () => {
  let component: SemesterModuleProgressChartComponent;
  let fixture: ComponentFixture<SemesterModuleProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SemesterModuleProgressChartComponent ]
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
