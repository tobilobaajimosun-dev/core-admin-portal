import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateInfoModalComponent } from './update-info-modal.component';

describe('UpdateInfoModalComponent', () => {
  let component: UpdateInfoModalComponent;
  let fixture: ComponentFixture<UpdateInfoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateInfoModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateInfoModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
