import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardDialogComponent } from './standard-dialog.component';

describe('StandardDialogComponent', () => {
  let component: StandardDialogComponent;
  let fixture: ComponentFixture<StandardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StandardDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
