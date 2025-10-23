import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleDetailsDialogComponent } from './module-details-dialog.component';

describe('ModuleDetailsDialogComponent', () => {
  let component: ModuleDetailsDialogComponent;
  let fixture: ComponentFixture<ModuleDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuleDetailsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
