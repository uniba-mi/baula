import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyPathUpdateComponent } from './study-path-update.component';

describe('StudyPathUpdateComponent', () => {
  let component: StudyPathUpdateComponent;
  let fixture: ComponentFixture<StudyPathUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudyPathUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudyPathUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
