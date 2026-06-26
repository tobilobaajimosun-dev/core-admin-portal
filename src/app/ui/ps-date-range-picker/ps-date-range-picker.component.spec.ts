import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsDateRangePickerComponent } from './ps-date-range-picker.component';

describe('PsDateRangePickerComponent', () => {
  let component: PsDateRangePickerComponent;
  let fixture: ComponentFixture<PsDateRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsDateRangePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PsDateRangePickerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
