  import { Component, Input, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { NotificationService } from '../../../core/services/notification/notification.service';
  import { finalize } from 'rxjs';
  import {User, UserStats} from '../../../core/models/user/user.model';
  import { UserStatsService } from '../../../core/services/user/user-stats.service';
  import {AuthService} from '../../../core/services/authentication/auth.service';
  import {determineUserRoles} from '../../../core/utils/role-utils';
  import {getCurrentUserDetails} from '../../../core/utils/user-utils';

  @Component({
    selector: 'app-profile-stats',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile-stats.component.html',
    styleUrls: ['./profile-stats.component.css']
  })
  export class ProfileStatsComponent implements OnInit {
    @Input() userId: number | null = null;
    currentUser: null = null;
    userStats: UserStats | null = null;
    isLoading = false;
    isDonor = false;
    isBeneficiary = false;
    isAdmin = false;

    constructor(
      private userStatsService: UserStatsService,
      private notificationService: NotificationService,
      private authService: AuthService
    ) {}

    ngOnInit(): void {
      getCurrentUserDetails(this.authService).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.isLoading = false;
          this.determineUserRole();
          this.loadStats();
          console.log('Profil utilisateur chargé et état mis à jour:', user);
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil:', error);
          this.isLoading = false;
        }
      });


    }

    determineUserRole(): void {
      console.log('User:', this.currentUser);
      const roles = determineUserRoles(this.currentUser);
      this.isDonor = roles.isDonor;
      this.isBeneficiary = roles.isBeneficiary;
      this.isAdmin = roles.isAdmin;

    }

    loadStats(): void {
      if (!this.userId) {
        this.notificationService.error('User ID is required to load statistics');
        return;
      }

      this.isLoading = true;

      let statsObservable;
      if (this.isDonor) {
        statsObservable = this.userStatsService.getDonorStats(this.userId);
      } else if (this.isBeneficiary) {
        statsObservable = this.userStatsService.getBeneficiaryStats(this.userId);
      } else {
        statsObservable = this.userStatsService.getUserStats(this.userId);
      }

      statsObservable
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (stats) => {
            this.userStats = stats;
            this.determineUserRole();
          },
          error: (error) => {
            console.error('Error loading user statistics:', error);
            this.notificationService.error('Failed to load user statistics');
          }
        });
    }

    reloadStats(): void {
      this.loadStats();
    }
  }
