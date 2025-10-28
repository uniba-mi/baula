import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintsSidenavComponent } from './hints-sidenav.component';

describe('HintsSidenavComponent', () => {
  let component: HintsSidenavComponent;
  let fixture: ComponentFixture<HintsSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HintsSidenavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HintsSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
