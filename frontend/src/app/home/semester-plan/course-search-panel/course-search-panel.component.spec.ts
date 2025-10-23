import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSearchPanelComponent } from './course-search-panel.component';

describe('CourseSearchPanelComponent', () => {
  let component: CourseSearchPanelComponent;
  let fixture: ComponentFixture<CourseSearchPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseSearchPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseSearchPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
