import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthStore } from '@core/store/auth.store';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authStore: InstanceType<typeof AuthStore>;
  let service: AuthService

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NonNullableFormBuilder, useValue: new FormBuilder() },
      ],
    }).compileComponents();
    authStore = TestBed.inject(AuthStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    service = TestBed.inject(AuthService);
    // authStore = TestBed.inject(AuthStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit form values to auth store when form is valid', () => {
    const formValues = { email: 'test@example.com', password: 'password', organization_id: '1' };
    component.loginForm.setValue(formValues);

    component.logUserIn();

    expect(authStore.login(formValues)).toHaveBeenCalledTimes(1);
    expect(authStore.login).toHaveBeenCalledWith(formValues);
  });

  it('should mark controls as dirty and touched when form is invalid', () => {
    const emailControl = component.loginForm.get('email')!;
    const passwordControl = component.loginForm.get('password')!;

    emailControl.setValue('');
    passwordControl.setValue('');

    component.logUserIn();

    expect(emailControl.dirty).toBe(true);
    expect(emailControl.touched).toBe(true);
    expect(passwordControl.dirty).toBe(true);
    expect(passwordControl.touched).toBe(true);
  });

  it('should update control validity when form is invalid', () => {
    const emailControl = component.loginForm.get('email')!;
    const passwordControl = component.loginForm.get('password')!;

    emailControl.setValue('');
    passwordControl.setValue('');

    component.logUserIn();

    expect(emailControl.valid).toBe(false);
    expect(passwordControl.valid).toBe(false);
  });
});
