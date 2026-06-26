import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanScheduleComponent } from './loan-schedule.component';

describe('LoanScheduleComponent', () => {
  let component: LoanScheduleComponent;
  let fixture: ComponentFixture<LoanScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanScheduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanScheduleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
