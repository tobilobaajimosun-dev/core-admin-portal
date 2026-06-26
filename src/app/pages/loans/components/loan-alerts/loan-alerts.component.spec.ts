import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAlertsComponent } from './loan-alerts.component';

describe('LoanAlertsComponent', () => {
  let component: LoanAlertsComponent;
  let fixture: ComponentFixture<LoanAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanAlertsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanAlertsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
