import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFeatureWishesComponent } from './admin-feature-wishes.component';

describe('AdminFeatureWishesComponent', () => {
  let component: AdminFeatureWishesComponent;
  let fixture: ComponentFixture<AdminFeatureWishesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminFeatureWishesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFeatureWishesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
