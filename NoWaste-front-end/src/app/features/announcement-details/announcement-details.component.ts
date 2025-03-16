import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {CurrencyPipe, DatePipe, Location, NgClass, NgForOf, NgIf} from '@angular/common';
import {AnnouncementService} from '../../core/services/announcement/announcement.service';
import {Announcement} from '../../core/models/announcement/announcement.model';
import {AuthService} from '../../core/services/authentication/auth.service';
import {AnnouncementDetails} from '../../core/models/announcement-details.model';

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcement-details.component.html',
  imports: [
    NgIf,
    NgClass,
    NgForOf,
    DatePipe,
    CurrencyPipe
  ],
  styleUrls: ['./announcement-details.component.css']
})
export class AnnouncementDetailsComponent implements OnInit {
  announcementId: string = '';
  announcement: Announcement | null = null;
  details: AnnouncementDetails | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private announcementService: AnnouncementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.announcementId = id;
        this.loadAnnouncementDetails();
      } else {
        this.router.navigate(['/announcements']);
      }
    });
  }

  loadAnnouncementDetails(): void {
    this.isLoading = true;

    this.announcementService.getAnnouncementById(this.announcementId)
      .pipe(
        finalize(() => {
        })
      )
      .subscribe({
        next: (data) => {
          this.announcement = data;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load announcement';
          console.error('Error loading announcement:', error);
        }
      });
  }

  isOwner(announcement: Announcement): boolean {
    return announcement.userId === this.authService.getCurrentUser()?.id;
  }

  goBack(): void {
    this.location.back();
  }

  openEditAnnouncementModal(announcement: Announcement): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      queryParams: { edit: announcement.id },
      queryParamsHandling: 'merge'
    });
  }

  confirmDelete(announcement: Announcement): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      queryParams: { delete: announcement.id },
      queryParamsHandling: 'merge'
    });
  }

  contactOwner(announcement: Announcement): void {
    console.log('Contact owner for announcement:', announcement.id);
  }

  expressInterest(announcement: Announcement): void {
    console.log('Expressed interest in announcement:', announcement.id);
  }
}
