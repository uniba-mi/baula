import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDateTypesComponent } from './manage-date-types.component';

describe('ManageDateTypesComponent', () => {
  let component: ManageDateTypesComponent;
  let fixture: ComponentFixture<ManageDateTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageDateTypesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageDateTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
