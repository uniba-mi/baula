import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPathModuleDialogComponent } from './edit-path-module-dialog.component';

describe('EditPathModuleDialogComponent', () => {
  let component: EditPathModuleDialogComponent;
  let fixture: ComponentFixture<EditPathModuleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPathModuleDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPathModuleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
