import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnivISHelperDialogComponent } from './univis-helper-dialog.component';

describe('DialogComponent', () => {
  let component: UnivISHelperDialogComponent;
  let fixture: ComponentFixture<UnivISHelperDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnivISHelperDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnivISHelperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
