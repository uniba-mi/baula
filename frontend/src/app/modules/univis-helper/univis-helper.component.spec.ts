import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnivisHelperComponent } from './univis-helper.component';

describe('UnivisHelperComponent', () => {
  let component: UnivisHelperComponent;
  let fixture: ComponentFixture<UnivisHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnivisHelperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnivisHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
