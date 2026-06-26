import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentLoansComponent } from './recent-loans.component';

describe('RecentLoansComponent', () => {
  let component: RecentLoansComponent;
  let fixture: ComponentFixture<RecentLoansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentLoansComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentLoansComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
