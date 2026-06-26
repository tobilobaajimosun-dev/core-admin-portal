import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendNotificationModalComponent } from './send-notification-modal.component';

describe('SendNotificationModalComponent', () => {
  let component: SendNotificationModalComponent;
  let fixture: ComponentFixture<SendNotificationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendNotificationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SendNotificationModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
