import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAboutComponent } from './loan-about.component';

describe('LoanAboutComponent', () => {
  let component: LoanAboutComponent;
  let fixture: ComponentFixture<LoanAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanAboutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanAboutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
