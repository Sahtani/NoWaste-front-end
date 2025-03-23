import {Component, Output, EventEmitter, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../core/services/authentication/auth.service';
import {User} from '../../core/models/user/user.model';
import {Subject} from 'rxjs';
import {RouterLinkActive} from '@angular/router';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  currentUser: User | null = null;
  isDonor = false;
  isBenefiter = false;
  isAdmin = false;

  searchQuery = '';
  showSearchBar = false;

  showMobileMenu = false;
  showProfileDropdown = false;

  @Output() onLogin = new EventEmitter<void>();
  @Output() onSignup = new EventEmitter<void>();
  @Output() onLogout = new EventEmitter<void>();
  @Input() isLoggedIn = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.updateUserState();
    console.table(this.authService.getCurrentUser());
  }

  updateUserState(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      const roles = this.currentUser.role || [];
      this.isDonor = Array.isArray(roles) ? roles.includes('DONOR') : roles === 'DONOR';
      this.isBenefiter = Array.isArray(roles) ? roles.includes('BENEFITER') : roles === 'BENEFITER';
      this.isAdmin = Array.isArray(roles) ? roles.includes('ADMIN') : roles === 'ADMIN';
    } else {
      this.isDonor = false;
      this.isBenefiter = false;
      this.isAdmin = false;
    }
  }

  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchQuery = '';
    } else {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(this.searchQuery)}`;
      this.toggleSearchBar();
    }
  }

  login(): void {
    this.onLogin.emit();
  }

  signup(): void {
    this.onSignup.emit();
  }

  logout(): void {
    this.onLogout.emit();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      this.showProfileDropdown = false;
    }
  }

  toggleProfileDropdown(event: Event): void {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeDropdowns(): void {
    this.showProfileDropdown = false;
  }


}

