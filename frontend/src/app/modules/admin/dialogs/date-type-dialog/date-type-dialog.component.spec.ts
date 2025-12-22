import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTypeDialogComponent } from './date-type-dialog.component';

describe('DateTypeDialogComponent', () => {
  let component: DateTypeDialogComponent;
  let fixture: ComponentFixture<DateTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateTypeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DateTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
