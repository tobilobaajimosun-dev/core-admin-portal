import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationStatsComponent } from './notification-stats.component';

describe('NotificationStatsComponent', () => {
  let component: NotificationStatsComponent;
  let fixture: ComponentFixture<NotificationStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationStatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
