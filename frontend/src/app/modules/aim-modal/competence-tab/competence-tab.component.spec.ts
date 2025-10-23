import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenceTabComponent } from './competence-tab.component';

describe('CompetenceTabComponent', () => {
  let component: CompetenceTabComponent;
  let fixture: ComponentFixture<CompetenceTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompetenceTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetenceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
