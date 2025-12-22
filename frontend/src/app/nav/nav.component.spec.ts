import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let storeStub: Partial<Store>;
  let store: Store

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavComponent ],
      providers: [
        { provide: Store, useValue: storeStub }
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(Store),
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
