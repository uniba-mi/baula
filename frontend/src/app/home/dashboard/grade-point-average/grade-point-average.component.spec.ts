import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradePointAverageComponent } from './grade-point-average.component';

describe('GradePointAverageComponent', () => {
  let component: GradePointAverageComponent;
  let fixture: ComponentFixture<GradePointAverageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GradePointAverageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GradePointAverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
