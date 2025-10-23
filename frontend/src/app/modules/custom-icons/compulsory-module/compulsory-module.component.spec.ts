import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompulsoryModuleComponent } from './compulsory-module.component';

describe('CompulsoryModuleComponent', () => {
  let component: CompulsoryModuleComponent;
  let fixture: ComponentFixture<CompulsoryModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompulsoryModuleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompulsoryModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
