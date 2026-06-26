import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTableComponent } from './loan-table.component';

describe('LoanTableComponent', () => {
  let component: LoanTableComponent;
  let fixture: ComponentFixture<LoanTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
