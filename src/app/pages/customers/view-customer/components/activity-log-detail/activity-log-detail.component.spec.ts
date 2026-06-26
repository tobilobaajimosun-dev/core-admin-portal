import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLogDetailComponent } from './activity-log-detail.component';

describe('ActivityLogDetailComponent', () => {
  let component: ActivityLogDetailComponent;
  let fixture: ComponentFixture<ActivityLogDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityLogDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityLogDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
