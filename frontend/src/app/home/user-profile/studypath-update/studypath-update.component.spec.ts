import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudypathUpdateComponent } from './studypath-update.component';

describe('StudypathUpdateComponent', () => {
  let component: StudypathUpdateComponent;
  let fixture: ComponentFixture<StudypathUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudypathUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudypathUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
