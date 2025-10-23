import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoUserDialogComponent } from './demo-user-dialog.component';

describe('DemoUserDialogComponent', () => {
  let component: DemoUserDialogComponent;
  let fixture: ComponentFixture<DemoUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DemoUserDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
