import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWalletComponent } from './view-wallet.component';

describe('ViewWalletComponent', () => {
  let component: ViewWalletComponent;
  let fixture: ComponentFixture<ViewWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWalletComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewWalletComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
