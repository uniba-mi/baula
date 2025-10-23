import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecSidenavComponent } from './rec-sidenav.component';

describe('RecSidenavComponent', () => {
  let component: RecSidenavComponent;
  let fixture: ComponentFixture<RecSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecSidenavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
