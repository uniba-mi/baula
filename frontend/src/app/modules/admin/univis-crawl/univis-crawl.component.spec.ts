import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnivisCrawlComponent } from './univis-crawl.component';

describe('UnivisCrawlComponent', () => {
  let component: UnivisCrawlComponent;
  let fixture: ComponentFixture<UnivisCrawlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnivisCrawlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnivisCrawlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
