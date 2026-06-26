import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersTableComponent } from './customers-table.component';

describe('CustomersTableComponent', () => {
  let component: CustomersTableComponent;
  let fixture: ComponentFixture<CustomersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
