import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBalanceModalComponent } from './update-balance-modal.component';

describe('UpdateBalanceModalComponent', () => {
  let component: UpdateBalanceModalComponent;
  let fixture: ComponentFixture<UpdateBalanceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBalanceModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateBalanceModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
