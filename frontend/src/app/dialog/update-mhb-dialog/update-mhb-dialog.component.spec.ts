import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMhbDialogComponent } from './update-mhb-dialog.component';

describe('UpdateMhbDialogComponent', () => {
  let component: UpdateMhbDialogComponent;
  let fixture: ComponentFixture<UpdateMhbDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateMhbDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateMhbDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
