import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanSkeletonComponent } from './view-loan-skeleton.component';

describe('ViewLoanSkeletonComponent', () => {
  let component: ViewLoanSkeletonComponent;
  let fixture: ComponentFixture<ViewLoanSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLoanSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewLoanSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
