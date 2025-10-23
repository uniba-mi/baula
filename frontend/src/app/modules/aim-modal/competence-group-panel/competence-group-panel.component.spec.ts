import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenceGroupPanelComponent } from './competence-group-panel.component';

describe('CompetenceGroupPanelComponent', () => {
  let component: CompetenceGroupPanelComponent;
  let fixture: ComponentFixture<CompetenceGroupPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompetenceGroupPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetenceGroupPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
