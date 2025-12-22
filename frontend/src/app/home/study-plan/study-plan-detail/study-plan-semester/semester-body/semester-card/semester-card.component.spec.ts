import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterCardComponent } from './semester-card.component';

describe('SemesterCardComponent', () => {
  let component: SemesterCardComponent;
  let fixture: ComponentFixture<SemesterCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SemesterCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemesterCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
