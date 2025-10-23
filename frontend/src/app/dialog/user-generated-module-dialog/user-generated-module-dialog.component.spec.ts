import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGeneratedModuleDialogComponent } from './user-generated-module-dialog.component';

describe('UserGeneratedModuleDialogComponent', () => {
  let component: UserGeneratedModuleDialogComponent;
  let fixture: ComponentFixture<UserGeneratedModuleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserGeneratedModuleDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGeneratedModuleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
