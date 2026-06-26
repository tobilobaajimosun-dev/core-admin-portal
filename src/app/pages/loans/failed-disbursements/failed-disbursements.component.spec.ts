import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedDisbursementsComponent } from './failed-disbursements.component';

describe('FailedDisbursementsComponent', () => {
  let component: FailedDisbursementsComponent;
  let fixture: ComponentFixture<FailedDisbursementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FailedDisbursementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FailedDisbursementsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
