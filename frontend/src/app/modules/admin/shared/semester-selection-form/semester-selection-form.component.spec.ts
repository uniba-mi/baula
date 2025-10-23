import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterSelectionFormComponent } from './semester-selection-form.component';

describe('SemesterSelectionFormComponent', () => {
  let component: SemesterSelectionFormComponent;
  let fixture: ComponentFixture<SemesterSelectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SemesterSelectionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemesterSelectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
