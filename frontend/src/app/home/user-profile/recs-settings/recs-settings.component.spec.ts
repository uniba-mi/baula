import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecsSettingsComponent } from './recs-settings.component';

describe('RecsSettingsComponent', () => {
  let component: RecsSettingsComponent;
  let fixture: ComponentFixture<RecsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecsSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
