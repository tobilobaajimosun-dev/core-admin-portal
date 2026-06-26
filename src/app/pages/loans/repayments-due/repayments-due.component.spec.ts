import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepaymentsDueComponent } from './repayments-due.component';

describe('RepaymentsDueComponent', () => {
  let component: RepaymentsDueComponent;
  let fixture: ComponentFixture<RepaymentsDueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepaymentsDueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RepaymentsDueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
