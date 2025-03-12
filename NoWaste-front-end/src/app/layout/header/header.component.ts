import {Component, Output, EventEmitter, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../core/services/authentication/auth.service';


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
  @Output() onLogout = new EventEmitter<void>();
  @Input() isLoggedIn = false;
  constructor(
    public authService: AuthService,
  ) {}
  login(): void {
    this.onLogin.emit();
  }

  signup(): void {
    this.onSignup.emit();
  }

  logout(): void {
    this.onLogout.emit();
  }


}

