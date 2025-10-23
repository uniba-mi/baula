import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupNavigationComponent } from './group-navigation.component';

describe('GroupNavigationComponent', () => {
  let component: GroupNavigationComponent;
  let fixture: ComponentFixture<GroupNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupNavigationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
