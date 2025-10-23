import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyChangeDialogComponent } from './privacy-change-dialog.component';

describe('PrivacyChangeDialogComponent', () => {
  let component: PrivacyChangeDialogComponent;
  let fixture: ComponentFixture<PrivacyChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrivacyChangeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
