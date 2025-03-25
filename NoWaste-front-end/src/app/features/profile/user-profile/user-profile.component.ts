
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {ProfileInfoComponent} from '../profile-info/profile-info.component';
import {ProfileEditComponent} from '../profile-edit/profile-edit.component';
import {ProfileStatsComponent} from '../profile-stats/profile-stats.component';
import {ProfileAvatarComponent} from '../profile-avatar/profile-avatar.component';
import {User} from '../../../core/models/user/user.model';
import {UserProfileService} from '../../../core/services/user/user-profile.service';
import {NotificationService} from '../../../core/services/notification/notification.service';
import {AuthService} from '../../../core/services/authentication/auth.service';
import {NotificationComponent} from '../../notification/notification.component';
import {HeaderComponent} from '../../../layout/header/header.component';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProfileInfoComponent,
    ProfileEditComponent,
    ProfileStatsComponent,
    ProfileAvatarComponent,
    NotificationComponent,
    HeaderComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  activeTab: 'info' | 'edit' | 'stats' = 'info';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;

    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.id) {
      this.userProfileService.getUserProfile(currentUser.id).subscribe({
        next: (user) => {
          this.user = user;
          console.log(user,'test');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.notificationService.error('Failed to load user profile');
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
      this.notificationService.error('User ID not available');
    }
  }

  switchTab(tab: 'info' | 'edit' | 'stats'): void {
    this.activeTab = tab;
  }

  handleProfileUpdate(updatedUser: User): void {
    this.user = updatedUser;
    this.notificationService.success('Profile updated successfully');
    this.switchTab('info');
  }

  handleAvatarUpdate(imageUrl: string): void {
    if (this.user) {
      this.user = { ...this.user, avatar: imageUrl };
      this.notificationService.success('Profile picture updated successfully');
    }
  }

  handleLogin(): void {
    this.router.navigate(['/login']);
  }

  handleSignup(): void {
    this.router.navigate(['/register']);
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.notificationService.info('You have been logged out');
  }
}
