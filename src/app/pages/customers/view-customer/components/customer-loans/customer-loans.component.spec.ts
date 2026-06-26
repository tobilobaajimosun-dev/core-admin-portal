import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLoansComponent } from './customer-loans.component';

describe('CustomerLoansComponent', () => {
  let component: CustomerLoansComponent;
  let fixture: ComponentFixture<CustomerLoansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerLoansComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerLoansComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
