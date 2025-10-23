import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCardHeaderComponent } from './dashboard-card-header.component';

describe('DashboardCardHeaderComponent', () => {
  let component: DashboardCardHeaderComponent;
  let fixture: ComponentFixture<DashboardCardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardCardHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
