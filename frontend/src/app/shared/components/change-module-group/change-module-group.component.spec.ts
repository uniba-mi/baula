import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeModuleGroupComponent } from './change-module-group.component';

describe('ChangeModuleGroupComponent', () => {
  let component: ChangeModuleGroupComponent;
  let fixture: ComponentFixture<ChangeModuleGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeModuleGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeModuleGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
