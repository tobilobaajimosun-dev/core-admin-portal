import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerStatsComponent } from './customer-stats.component';

describe('CustomerStatsComponent', () => {
  let component: CustomerStatsComponent;
  let fixture: ComponentFixture<CustomerStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerStatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
