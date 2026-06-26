import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressVerificationModalComponent } from './address-verification-modal.component';

describe('AddressVerificationModalComponent', () => {
  let component: AddressVerificationModalComponent;
  let fixture: ComponentFixture<AddressVerificationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressVerificationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressVerificationModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
