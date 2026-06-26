import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionStatsComponent } from './transaction-stats.component';

describe('TransactionStatsComponent', () => {
  let component: TransactionStatsComponent;
  let fixture: ComponentFixture<TransactionStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionStatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
