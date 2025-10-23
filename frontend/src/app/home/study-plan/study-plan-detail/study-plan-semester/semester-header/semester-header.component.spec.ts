import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterHeaderComponent } from './semester-header.component';

describe('SemesterHeaderComponent', () => {
  let component: SemesterHeaderComponent;
  let fixture: ComponentFixture<SemesterHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SemesterHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemesterHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
