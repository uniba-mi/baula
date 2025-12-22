import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeModuleGroupDialogComponent } from './change-module-group-dialog.component';

describe('ChangeModuleGroupDialogComponent', () => {
  let component: ChangeModuleGroupDialogComponent;
  let fixture: ComponentFixture<ChangeModuleGroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeModuleGroupDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeModuleGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
