import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterBodyComponent } from './semester-body.component';

describe('SemesterBodyComponent', () => {
  let component: SemesterBodyComponent;
  let fixture: ComponentFixture<SemesterBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SemesterBodyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemesterBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
