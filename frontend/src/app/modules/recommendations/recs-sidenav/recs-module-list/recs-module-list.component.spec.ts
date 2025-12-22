import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecsModuleListComponent } from './recs-module-list.component';

describe('RecsModuleListComponent', () => {
  let component: RecsModuleListComponent;
  let fixture: ComponentFixture<RecsModuleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecsModuleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecsModuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
