import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanLiquidationComponent } from './loan-liquidation.component';

describe('LoanLiquidationComponent', () => {
  let component: LoanLiquidationComponent;
  let fixture: ComponentFixture<LoanLiquidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanLiquidationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanLiquidationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
