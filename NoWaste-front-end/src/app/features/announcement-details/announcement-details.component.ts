import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {CurrencyPipe, DatePipe, Location, NgClass, NgForOf, NgIf} from '@angular/common';
import {AnnouncementService} from '../../core/services/announcement/announcement.service';
import {Announcement} from '../../core/models/announcement/announcement.model';
import {AuthService} from '../../core/services/authentication/auth.service';
import {AnnouncementDetails} from '../../core/models/announcement-details.model';
import {environment} from '../../../environments/environment';
import {HeaderComponent} from '../../layout/header/header.component';
import {NotificationComponent} from '../notification/notification.component';
import {Roles, User} from '../../core/models/user/user.model';
import {determineUserRoles} from '../../core/utils/role-utils';
import {NotificationService} from '../../core/services/notification/notification.service';
import {AnnouncementStatus} from '../../core/enum/AnnouncementStatus';
import {ReservationService} from '../../core/services/reservation/reservation.service';

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcement-details.component.html',
  imports: [
    NgIf,
    NgClass,
    NgForOf,
    DatePipe,
    CurrencyPipe,
    HeaderComponent,
    NotificationComponent,
    RouterLink
  ],
  styleUrls: ['./announcement-details.component.css']
})
export class AnnouncementDetailsComponent implements OnInit {
  announcementId: string = '' ;
  announcement: Announcement | null = null;
  details: AnnouncementDetails | null = null;
  isLoading: boolean = false;
  announcements: Announcement[] = [];
  isAuthenticated: boolean = false;
  isDonor: boolean = false;
  isBeneficiary: boolean = false;
  hasMarkedInterest: boolean = false;
  interestedAnnouncements: Announcement[] = [];
  approvedAnnouncements: Announcement[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

    const currentUserFromToken = this.authService.getCurrentUser();

    if (this.isAuthenticated && currentUserFromToken && currentUserFromToken.id) {
      const currentUserId: number = currentUserFromToken.id;

      this.authService.getUserById(currentUserId).subscribe({
        next: (userDetails) => {
          const roles = determineUserRoles(userDetails);
          this.isDonor = roles.isDonor;
          this.isBeneficiary = roles.isBeneficiary;
          this.loadAnnouncementData();
          this.loadMyInterests();
        },
        error: (error) => {
          const roles = determineUserRoles(currentUserFromToken);
          this.isDonor = roles.isDonor;
          this.isBeneficiary = roles.isBeneficiary;
          this.loadAnnouncementData();
        }
      });
    } else {
      this.isDonor = false;
      this.isBeneficiary = false;
      this.loadAnnouncementData();
    }
  }

  private loadAnnouncementData(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.announcementId = id;
        this.loadAnnouncementDetails();
      } else {
        this.loadAllAnnouncements();
      }
    });
  }

  private loadAnnouncementDetails(): void {
    this.isLoading = true;

    this.announcementService.getAnnouncementById(this.announcementId).subscribe({
      next: (data) => {
        this.announcement = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error('Impossible de charger les détails de l\'annonce');
        this.router.navigate(['/announcements']);
      }
    });
  }

  private loadAllAnnouncements(): void {
    this.isLoading = true;

    this.announcementService.getAnnouncements().subscribe({
      next: (data) => {
        this.announcements = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error('Impossible de charger les annonces');
      }
    });
  }

  loadMyInterests(): void {
    this.isLoading = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.notificationService.error('Unable to load your interests');
      return;
    }

    this.announcementService.getInterestedAnnouncements(currentUser.id).subscribe({
      next: (data) => {
        this.approvedAnnouncements = data.filter(a => a.approved);
        this.interestedAnnouncements = data.filter(a => !a.approved);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading interested announcements:', error);
        this.notificationService.error('Failed to load your interested announcements');
        this.isLoading = false;
      }
    });
  }

  cancelInterest(announcementId: string): void {
    this.isLoading = true;

    this.announcementService.cancelInterest(announcementId).subscribe({
      next: () => {
        this.interestedAnnouncements = this.interestedAnnouncements.filter(a => a.id !== announcementId);
        this.notificationService.success('Your interest has been cancelled');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cancelling interest:', error);
        this.notificationService.error('An error occurred while cancelling your interest');
        this.isLoading = false;
      }
    });
  }

  approveInterest(announcementId: string | undefined, beneficiaryId: number): void {
    if (!this.isAuthenticated || !this.isDonor) {
      this.notificationService.error('You must be logged in as a donor to approve reservations');
      return;
    }

    this.isLoading = true;

    this.announcementService.approveInterest(announcementId, beneficiaryId).subscribe({
      next: (response) => {
        if (response) {
          this.announcement = response;

          if (this.announcement) {
            this.announcement.status = AnnouncementStatus.RESERVED;

            if (this.details && this.details.interestedUsers) {
              this.announcement.beneficiary = this.details.interestedUsers.find(
                (user: any) => user.id === beneficiaryId
              );

              const userIndex = this.details.interestedUsers.findIndex(
                (user: any) => user.id === beneficiaryId
              );

              if (userIndex !== -1) {
                this.notificationService.success('You have confirmed the reservation');
              }
            }
          }
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error approving reservation:', error);
        this.notificationService.error('An error occurred while confirming the reservation');
        this.isLoading = false;
      }
    });
  }

  isOwner(announcement: Announcement): boolean {
    return announcement.donor?.id === this.authService.getCurrentUser()?.id;
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

  markInterest(): void {
    if (!this.isAuthenticated || !this.isBeneficiary) {
      this.notificationService.error('You must be logged in as a beneficiary to reserve this item');
      return;
    }

    this.isLoading = true;
    this.announcementService.markInterest(Number(this.announcementId)).subscribe({
      next: (response) => {
        const reservationRequest = {
          announcementId: this.announcementId,
          beneficiaryId: this.authService.getCurrentUser()?.id,
          reservationDate: new Date()
        };

        this.reservationService.createReservation(reservationRequest).subscribe({
          next: (reservationResponse) => {
            this.announcement = response;
            this.hasMarkedInterest = true;
            this.notificationService.success('Your reservation request has been sent');
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating reservation:', error);
            this.notificationService.warning('Interest marked but reservation could not be created');
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error marking interest:', error);
        this.notificationService.error('An error occurred while reserving this item');
        this.isLoading = false;
      }
    });
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      return '';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('/api/')) {

      const path = imagePath.startsWith('/api/') ? imagePath.substring(4) : imagePath;
      return `${environment.apiUrlDash}${path}`;
    }

    return `${environment.apiUrlDash}${imagePath}`;
  }

  handleLogin(): void {

  }

  handleSignup(): void {

  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}


