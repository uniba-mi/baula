import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleCourseConnectionComponent } from './module-course-connection.component';

describe('ModuleCourseConnectionComponent', () => {
  let component: ModuleCourseConnectionComponent;
  let fixture: ComponentFixture<ModuleCourseConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModuleCourseConnectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModuleCourseConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
