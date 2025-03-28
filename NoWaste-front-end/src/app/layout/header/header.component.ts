import {Component, Output, EventEmitter, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../core/services/authentication/auth.service';
import {Roles, User} from '../../core/models/user/user.model';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NotificationData} from '../../core/models/notification.model';
import {determineUserRoles} from '../../core/utils/role-utils';


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
  isBeneficiary = false;
  isAdmin = false;

  notifications: NotificationData[] = [];
  unreadNotificationsCount = 0;
  showNotifications = false;

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
    const roles = determineUserRoles(this.currentUser);
    this.isDonor = roles.isDonor;
    this.isBeneficiary = roles.isBeneficiary;
    this.isAdmin = roles.isAdmin;
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

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {

    this.notifications = [
        {
          type: 'success',
          message: 'New reservation for your donation "Fresh Vegetables"',
          time: new Date(),
          read: false,
          icon: 'check-circle'
        },
        {
          type: 'info',
          message: 'Your pickup is scheduled for tomorrow at 2pm',
          time: new Date(Date.now() - 3600000),
          read: true,
          icon: 'info-circle'
        }
    ];
    this.unreadNotificationsCount = this.notifications.filter(n => !n.read).length;
  }

  markAllAsRead(): void {
    // Appeler votre service ici puis mettre à jour l'UI
    this.notifications.forEach(n => n.read = true);
    this.unreadNotificationsCount = 0;
  }

  handleNotificationClick(notification: any): void {
    // Marquer comme lue et naviguer si nécessaire
    notification.read = true;
    this.unreadNotificationsCount = this.notifications.filter(n => !n.read).length;
    // Naviguer en fonction du type, etc.
  }
}

