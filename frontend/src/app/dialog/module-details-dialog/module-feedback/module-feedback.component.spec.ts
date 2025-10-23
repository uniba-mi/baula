import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleFeedbackComponent } from './module-feedback.component';

describe('ModuleFeedbackComponent', () => {
  let component: ModuleFeedbackComponent;
  let fixture: ComponentFixture<ModuleFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModuleFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
