import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecModuleListComponent } from './rec-module-list.component';

describe('RecModuleListComponent', () => {
  let component: RecModuleListComponent;
  let fixture: ComponentFixture<RecModuleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecModuleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecModuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
