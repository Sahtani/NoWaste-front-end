
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import {UserProfileService} from '../../../core/services/user/user-profile.service';
import {UserStats} from '../../../core/models/user/user.model';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-stats.component.html',
  styleUrls: ['./profile-stats.component.css']
})
export class ProfileStatsComponent implements OnInit {
  @Input() userId!: number;

  stats: UserStats | null = null;
  isLoading = false;

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.isLoading = true;

    this.userProfileService.getUserStats()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading user stats:', error);
        }
      });
  }
}
