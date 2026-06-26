import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendCustomerModalComponent } from './suspend-customer-modal.component';

describe('SuspendCustomerModalComponent', () => {
  let component: SuspendCustomerModalComponent;
  let fixture: ComponentFixture<SuspendCustomerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuspendCustomerModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuspendCustomerModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
