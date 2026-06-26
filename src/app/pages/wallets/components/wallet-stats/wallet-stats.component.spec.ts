import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletStatsComponent } from './wallet-stats.component';

describe('WalletStatsComponent', () => {
  let component: WalletStatsComponent;
  let fixture: ComponentFixture<WalletStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletStatsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
