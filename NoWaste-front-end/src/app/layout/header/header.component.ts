import {Component, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() onLogin = new EventEmitter<void>();
  @Output() onSignup = new EventEmitter<void>();

  loginClick(): void {
    this.onLogin.emit();
  }

  signupClick(): void {
    this.onSignup.emit()
} }

