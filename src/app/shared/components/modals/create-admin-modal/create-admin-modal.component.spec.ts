import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdminModalComponent } from './create-admin-modal.component';

describe('CreateAdminModalComponent', () => {
  let component: CreateAdminModalComponent;
  let fixture: ComponentFixture<CreateAdminModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAdminModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAdminModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
