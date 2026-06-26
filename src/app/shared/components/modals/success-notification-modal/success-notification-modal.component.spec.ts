import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessNotificationModalComponent } from './success-notification-modal.component';

describe('SuccessNotificationModalComponent', () => {
  let component: SuccessNotificationModalComponent;
  let fixture: ComponentFixture<SuccessNotificationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessNotificationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessNotificationModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
