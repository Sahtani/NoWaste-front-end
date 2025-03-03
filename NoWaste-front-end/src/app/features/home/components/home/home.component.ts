
import { Component, inject, signal } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {HeaderComponent} from '../../../../layout/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  showLogin = signal(false);
  showSignup = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  signupForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    agreeTerms: [false, Validators.requiredTrue]
  }, { validator: this.passwordMatchValidator });
  handleHeaderLoginClick(show: boolean): void {
    this.showLogin.set(show);
  }

  handleHeaderSignupClick(show: boolean): void {
    this.showSignup.set(show);
  }

  // Stats for display
  impactStats = [
    { label: 'Households', value: '10,000+' },
    { label: 'Food Saved', value: '50 tons' },
    { label: 'CO₂ Reduction', value: '150 tons' }
  ];

  constructor() {
    this.initLoginForm();
    this.initSignupForm();
  }

  initLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  initSignupForm(): void {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup): null | object {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  showLoginForm(): void {
    this.showLogin.set(true);
    this.showSignup.set(false);
  }

  hideLoginForm(): void {
    this.showLogin.set(false);
    this.resetForms();
  }

  showSignupForm(): void {
    this.showSignup.set(true);
    this.showLogin.set(false);
  }

  hideSignupForm(): void {
    this.showSignup.set(false);
    this.resetForms();
  }

  switchToSignup(): void {
    this.showLogin.set(false);
    this.showSignup.set(true);
  }

  switchToLogin(): void {
    this.showSignup.set(false);
    this.showLogin.set(true);
  }

  resetForms(): void {
    this.loginForm.reset();
    this.signupForm.reset();
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      console.log('Login form submitted:', this.loginForm.value);
      // TODO: Implement login logic with your authentication service
      this.hideLoginForm();
      this.router.navigate(['/dashboard']);
    }
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      console.log('Signup form submitted:', this.signupForm.value);
      // TODO: Implement signup logic with your authentication service
      this.hideSignupForm();
      this.router.navigate(['/dashboard']);
    }
  }
}
