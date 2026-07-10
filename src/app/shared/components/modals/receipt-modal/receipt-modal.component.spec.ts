import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptModalComponent } from './receipt-modal.component';

describe('ReceiptModalComponent', () => {
  let component: ReceiptModalComponent;
  let fixture: ComponentFixture<ReceiptModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
