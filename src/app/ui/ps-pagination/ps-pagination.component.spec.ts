import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PsPaginationComponent } from './ps-pagination.component';

describe('KbPaginationComponent', () => {
  let component: PsPaginationComponent;
  let fixture: ComponentFixture<PsPaginationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PsPaginationComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsPaginationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalItems', 10);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
