import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaDataCardComponent } from './meta-data-card.component';

describe('MetaDataCardComponent', () => {
  let component: MetaDataCardComponent;
  let fixture: ComponentFixture<MetaDataCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetaDataCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetaDataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
