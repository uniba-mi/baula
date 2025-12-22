import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecsModuleCardComponent } from './recs-module-card.component';

describe('RecsModuleCardComponent', () => {
  let component: RecsModuleCardComponent;
  let fixture: ComponentFixture<RecsModuleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecsModuleCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecsModuleCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
