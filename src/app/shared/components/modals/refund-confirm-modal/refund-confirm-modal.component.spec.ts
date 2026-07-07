import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundConfirmModalComponent } from './refund-confirm-modal.component';

describe('RefundConfirmModalComponent', () => {
  let component: RefundConfirmModalComponent;
  let fixture: ComponentFixture<RefundConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundConfirmModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RefundConfirmModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
