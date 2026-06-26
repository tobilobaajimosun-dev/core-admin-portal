import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransactionComponent } from './view-transaction.component';

describe('ViewTransactionComponent', () => {
  let component: ViewTransactionComponent;
  let fixture: ComponentFixture<ViewTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTransactionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTransactionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
