import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentCustomersComponent } from './recent-customers.component';

describe('RecentCustomersComponent', () => {
  let component: RecentCustomersComponent;
  let fixture: ComponentFixture<RecentCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentCustomersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentCustomersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
