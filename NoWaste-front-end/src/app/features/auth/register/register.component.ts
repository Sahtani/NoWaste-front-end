import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  @Output() signupSuccess = new EventEmitter<any>();
  isRegistering = false;
  registrationError: string | null = null;
  registrationSuccess = false;
  private fb = inject(FormBuilder);
  signupForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
    address: ['', Validators.required],
    role: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    agreeTerms: [false, Validators.requiredTrue]
  }, {validators: this.passwordMatchValidator});
  private authService = inject(AuthService);

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {mismatch: true};
  }

  hideModal(): void {
    this.close.emit();
  }

  onSwitchToLogin(): void {
    this.switchToLogin.emit();
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isRegistering = true;
    this.registrationError = null;

    const signupData = {
      name: this.signupForm.value.name,
      email: this.signupForm.value.email,
      phone: this.signupForm.value.phone,
      address: this.signupForm.value.address,
      role: this.signupForm.value.role,
      password: this.signupForm.value.password

    };

    this.authService.register(signupData).subscribe({

      next: (response) => {
        this.isRegistering = false;
        this.registrationSuccess = true;
        this.signupSuccess.emit(response);
      },
      error: (error) => {
        this.isRegistering = false;
        this.registrationError = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

}
