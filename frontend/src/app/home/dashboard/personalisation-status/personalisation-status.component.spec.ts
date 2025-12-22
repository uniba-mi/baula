import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalisationStatusComponent } from './personalisation-status.component';

describe('PersonalisationStatusComponent', () => {
  let component: PersonalisationStatusComponent;
  let fixture: ComponentFixture<PersonalisationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalisationStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalisationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
