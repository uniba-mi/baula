import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGradeDialogComponent } from './edit-grade-dialog.component';

describe('EditGradeDialogComponent', () => {
  let component: EditGradeDialogComponent;
  let fixture: ComponentFixture<EditGradeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditGradeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditGradeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
