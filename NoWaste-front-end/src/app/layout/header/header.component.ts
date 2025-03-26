import {Component, Output, EventEmitter, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../core/services/authentication/auth.service';
import {Roles, User} from '../../core/models/user/user.model';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, FormsModule, RouterLink],
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

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const basicUser = this.authService.getCurrentUser();

    if (basicUser && basicUser.id) {
      this.authService.getUserById(basicUser.id).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.updateUserState();
          console.log('Profil utilisateur chargé et état mis à jour:', user);
          console.log('role',user.role);
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil:', error);
          this.currentUser = basicUser;
          this.updateUserState();
        }
      });
    } else {
      this.currentUser = null;
      this.updateUserState();
      console.log('Aucun utilisateur connecté ou ID non disponible');
    }
  }

  updateUserState(): void {
    if (this.currentUser) {
      const role = this.currentUser.role || '';
      this.isDonor =
        role === Roles.DONOR ||
        role === 'ROLE_' + Roles.DONOR ||
        (Array.isArray(role) && (role.includes(Roles.DONOR) || role.includes('ROLE_' + Roles.DONOR)));

      this.isBenefiter =
        role === Roles.BENEFICIARY ||
        role === 'ROLE_' + Roles.BENEFICIARY ||
        (Array.isArray(role) && (role.includes(Roles.BENEFICIARY) || role.includes('ROLE_' + Roles.BENEFICIARY)));

      this.isAdmin =
        role === Roles.ADMIN ||
        role === 'ROLE_' + Roles.ADMIN ||
        (Array.isArray(role) && (role.includes(Roles.ADMIN) || role.includes('ROLE_' + Roles.ADMIN)));
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
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  protected readonly console = console;
}

