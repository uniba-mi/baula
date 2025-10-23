import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AimModalComponent } from './aim-modal.component';

describe('AimModalComponent', () => {
  let component: AimModalComponent;
  let fixture: ComponentFixture<AimModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AimModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AimModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
