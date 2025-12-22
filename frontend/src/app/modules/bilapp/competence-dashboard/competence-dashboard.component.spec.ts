import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenceDashboardComponent } from './competence-dashboard.component';

describe('CompetenceDashboardComponent', () => {
  let component: CompetenceDashboardComponent;
  let fixture: ComponentFixture<CompetenceDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompetenceDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetenceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
