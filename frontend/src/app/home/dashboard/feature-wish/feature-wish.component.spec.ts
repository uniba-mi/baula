import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureWishComponent } from './feature-wish.component';

describe('FeatureWishComponent', () => {
  let component: FeatureWishComponent;
  let fixture: ComponentFixture<FeatureWishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeatureWishComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureWishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
