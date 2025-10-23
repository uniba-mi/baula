import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecModuleCardComponent } from './rec-module-card.component';

describe('RecModuleCardComponent', () => {
  let component: RecModuleCardComponent;
  let fixture: ComponentFixture<RecModuleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecModuleCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecModuleCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
