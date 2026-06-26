import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopFundedWalletsComponent } from './top-funded-wallets.component';

describe('TopFundedWalletsComponent', () => {
  let component: TopFundedWalletsComponent;
  let fixture: ComponentFixture<TopFundedWalletsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopFundedWalletsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopFundedWalletsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
