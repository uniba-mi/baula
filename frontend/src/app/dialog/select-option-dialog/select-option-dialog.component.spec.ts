import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOptionDialog } from './select-option-dialog.component';

describe('SelectOptionDialog', () => {
  let component: SelectOptionDialog;
  let fixture: ComponentFixture<SelectOptionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectOptionDialog ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectOptionDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
