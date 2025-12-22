import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnivisCrawlDialogComponent } from './univis-crawl-dialog.component';

describe('UnivisCrawlDialogComponent', () => {
  let component: UnivisCrawlDialogComponent;
  let fixture: ComponentFixture<UnivisCrawlDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnivisCrawlDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnivisCrawlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
