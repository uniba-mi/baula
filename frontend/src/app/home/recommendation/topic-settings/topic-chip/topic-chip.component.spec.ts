import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicChipComponent } from './topic-chip.component';

describe('TopicChipComponent', () => {
  let component: TopicChipComponent;
  let fixture: ComponentFixture<TopicChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopicChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
