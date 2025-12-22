import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleStatusComponent } from './module-status.component';

describe('ModuleStatusComponent', () => {
  let component: ModuleStatusComponent;
  let fixture: ComponentFixture<ModuleStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuleStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuleStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
