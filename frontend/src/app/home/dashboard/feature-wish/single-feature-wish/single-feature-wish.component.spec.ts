import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleFeatureWishComponent } from './single-feature-wish.component';

describe('SingleFeatureWishComponent', () => {
  let component: SingleFeatureWishComponent;
  let fixture: ComponentFixture<SingleFeatureWishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SingleFeatureWishComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleFeatureWishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
