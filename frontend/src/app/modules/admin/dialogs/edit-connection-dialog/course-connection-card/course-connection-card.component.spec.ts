import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseConnectionCardComponent } from './course-connection-card.component';

describe('CourseConnectionCardComponent', () => {
  let component: CourseConnectionCardComponent;
  let fixture: ComponentFixture<CourseConnectionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourseConnectionCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourseConnectionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
