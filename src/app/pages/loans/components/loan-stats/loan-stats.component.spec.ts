import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanStatsComponent } from './loan-stats.component';

describe('LoanStatsComponent', () => {
  let component: LoanStatsComponent;
  let fixture: ComponentFixture<LoanStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanStatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
