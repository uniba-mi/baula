import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSemesterDialogComponent } from './select-semester-dialog.component';

describe('SelectSemesterDialogComponent', () => {
  let component: SelectSemesterDialogComponent;
  let fixture: ComponentFixture<SelectSemesterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectSemesterDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectSemesterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
