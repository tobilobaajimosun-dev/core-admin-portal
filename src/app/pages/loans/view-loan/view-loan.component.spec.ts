import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanComponent } from './view-loan.component';

describe('ViewLoanComponent', () => {
  let component: ViewLoanComponent;
  let fixture: ComponentFixture<ViewLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLoanComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewLoanComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
