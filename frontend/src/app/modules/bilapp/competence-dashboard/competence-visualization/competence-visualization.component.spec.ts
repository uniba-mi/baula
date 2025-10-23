import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenceVisualizationComponent } from './competence-visualization.component';

describe('CompetenceVisualizationComponent', () => {
  let component: CompetenceVisualizationComponent;
  let fixture: ComponentFixture<CompetenceVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompetenceVisualizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetenceVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
