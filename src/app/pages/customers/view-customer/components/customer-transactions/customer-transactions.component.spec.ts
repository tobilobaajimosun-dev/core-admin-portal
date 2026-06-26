import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTransactionsComponent } from './customer-transactions.component';

describe('CustomerTransactionsComponent', () => {
  let component: CustomerTransactionsComponent;
  let fixture: ComponentFixture<CustomerTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerTransactionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerTransactionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
