import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecsSidenavComponent } from './recs-sidenav.component';

describe('RecsSidenavComponent', () => {
  let component: RecsSidenavComponent;
  let fixture: ComponentFixture<RecsSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecsSidenavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecsSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
