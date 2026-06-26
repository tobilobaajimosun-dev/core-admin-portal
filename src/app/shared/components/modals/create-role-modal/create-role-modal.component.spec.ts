import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRoleModalComponent } from './create-role-modal.component';

describe('CreateRoleModalComponent', () => {
  let component: CreateRoleModalComponent;
  let fixture: ComponentFixture<CreateRoleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoleModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoleModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
