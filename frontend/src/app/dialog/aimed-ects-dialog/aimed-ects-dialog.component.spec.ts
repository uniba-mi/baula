import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AimedEctsDialogComponent } from './aimed-ects-dialog.component';

describe('AimedEctsDialogComponent', () => {
  let component: AimedEctsDialogComponent;
  let fixture: ComponentFixture<AimedEctsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AimedEctsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AimedEctsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
