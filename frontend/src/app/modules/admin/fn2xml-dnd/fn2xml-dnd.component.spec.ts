import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fn2xmlDndComponent } from './fn2xml-dnd.component';

describe('Fn2xmlDndComponent', () => {
  let component: Fn2xmlDndComponent;
  let fixture: ComponentFixture<Fn2xmlDndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Fn2xmlDndComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Fn2xmlDndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
