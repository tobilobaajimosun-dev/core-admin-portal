import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRecentActivityComponent } from './customer-recent-activity.component';

describe('CustomerRecentActivityComponent', () => {
  let component: CustomerRecentActivityComponent;
  let fixture: ComponentFixture<CustomerRecentActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRecentActivityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerRecentActivityComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
