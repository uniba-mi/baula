import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDataPrivacyComponent } from './upload-data-privacy.component';

describe('UploadDataPrivacyComponent', () => {
  let component: UploadDataPrivacyComponent;
  let fixture: ComponentFixture<UploadDataPrivacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadDataPrivacyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadDataPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
