import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/authentication/auth.service';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() switchToSignup = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<any>();

  isLoggingIn = false;
  loginError: string | null = null;

  private fb = inject(FormBuilder);
  constructor(private router: Router) {}

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });
  private authService = inject(AuthService);

  hideModal(): void {
    this.close.emit();
  }

  onSwitchToSignup(): void {
    this.switchToSignup.emit();
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoggingIn = true;
    this.loginError = null;

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoggingIn = false;
        this.loginSuccess.emit(response);

      },
      error: (error) => {
        this.isLoggingIn = false;
        this.loginError = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

}
