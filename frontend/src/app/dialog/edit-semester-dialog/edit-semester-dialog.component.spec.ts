import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSemesterDialogComponent } from './edit-semester-dialog.component';

describe('EditSemesterDialogComponent', () => {
  let component: EditSemesterDialogComponent;
  let fixture: ComponentFixture<EditSemesterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSemesterDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSemesterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
