import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { finalize } from 'rxjs';
import {UserStats} from '../../../core/models/user/user.model';
import {UserStatsService} from '../../../core/services/user/user-stats.service';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-stats.component.html',
  styleUrls: ['./profile-stats.component.css']
})
export class ProfileStatsComponent implements OnInit {
  @Input() userId: number | null = null;

  userStats: UserStats | null = null;
  isLoading = false;

  constructor(
    private userStatsService: UserStatsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    if (!this.userId) {
      this.notificationService.error('User ID is required to load statistics');
      return;
    }

    this.isLoading = true;

    this.userStatsService.getUserStats(this.userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (stats: UserStats | null) => {
          this.userStats = stats;
        },
        error: (error: any) => {
          console.error('Error loading user statistics:', error);
          this.notificationService.error('Failed to load user statistics');
        }
      });
  }
}
