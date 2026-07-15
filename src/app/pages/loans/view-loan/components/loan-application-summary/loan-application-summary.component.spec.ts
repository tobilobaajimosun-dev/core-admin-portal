import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanApplicationSummaryComponent } from './loan-application-summary.component';

describe('LoanApplicationSummaryComponent', () => {
  let component: LoanApplicationSummaryComponent;
  let fixture: ComponentFixture<LoanApplicationSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanApplicationSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanApplicationSummaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
