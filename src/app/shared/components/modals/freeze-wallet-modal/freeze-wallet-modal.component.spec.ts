import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezeWalletModalComponent } from './freeze-wallet-modal.component';

describe('FreezeWalletModalComponent', () => {
  let component: FreezeWalletModalComponent;
  let fixture: ComponentFixture<FreezeWalletModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreezeWalletModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FreezeWalletModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
