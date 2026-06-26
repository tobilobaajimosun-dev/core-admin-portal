import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDocumentsComponent } from './loan-documents.component';

describe('LoanDocumentsComponent', () => {
  let component: LoanDocumentsComponent;
  let fixture: ComponentFixture<LoanDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanDocumentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanDocumentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
