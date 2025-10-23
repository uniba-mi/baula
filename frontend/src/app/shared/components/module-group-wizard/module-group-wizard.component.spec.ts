import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleGroupWizardComponent } from './module-group-wizard.component';

describe('ModuleGroupWizardComponent', () => {
  let component: ModuleGroupWizardComponent;
  let fixture: ComponentFixture<ModuleGroupWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModuleGroupWizardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModuleGroupWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
