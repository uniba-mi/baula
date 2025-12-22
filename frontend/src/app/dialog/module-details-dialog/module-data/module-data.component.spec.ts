import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleDataComponent } from './module-data.component';

describe('ModuleDataComponent', () => {
  let component: ModuleDataComponent;
  let fixture: ComponentFixture<ModuleDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModuleDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
