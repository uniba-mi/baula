import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRecsComponent } from './admin-recs.component';

describe('AdminRecsComponent', () => {
  let component: AdminRecsComponent;
  let fixture: ComponentFixture<AdminRecsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminRecsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRecsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
