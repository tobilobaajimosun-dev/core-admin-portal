import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailNotificationsComponent } from './email-notifications.component';

describe('EmailNotificationsComponent', () => {
  let component: EmailNotificationsComponent;
  let fixture: ComponentFixture<EmailNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailNotificationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailNotificationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
