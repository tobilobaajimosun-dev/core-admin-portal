import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockedOutModalComponent } from './locked-out-modal.component';

describe('LockedOutModalComponent', () => {
  let component: LockedOutModalComponent;
  let fixture: ComponentFixture<LockedOutModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockedOutModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LockedOutModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
