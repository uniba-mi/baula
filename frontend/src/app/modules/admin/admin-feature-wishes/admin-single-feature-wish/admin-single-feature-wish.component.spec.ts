import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSingleFeatureWishComponent } from './admin-single-feature-wish.component';

describe('AdminSingleFeatureWishComponent', () => {
  let component: AdminSingleFeatureWishComponent;
  let fixture: ComponentFixture<AdminSingleFeatureWishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminSingleFeatureWishComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSingleFeatureWishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
