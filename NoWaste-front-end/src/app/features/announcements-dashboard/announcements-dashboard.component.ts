import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewRef, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AnnouncementService } from '../../core/services/announcement/announcement.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { Announcement } from '../../core/models/announcement/announcement.model';
import { AuthService } from '../../core/services/authentication/auth.service';
import { AnnouncementFormComponent } from '../announcement-form/announcement-form.component';
import { NotificationComponent } from '../notification/notification.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, SlicePipe } from '@angular/common';
import { AnnouncementRequest } from '../../core/models/announcement-request.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-announcements-dashboard',
  templateUrl: './announcements-dashboard.component.html',
  imports: [
    AnnouncementFormComponent,
    NotificationComponent,
    HeaderComponent,
    FormsModule,
    NgForOf,
    NgClass,
    NgIf,
    SlicePipe,
    DatePipe,
    CurrencyPipe
  ],
  styleUrls: ['./announcements-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnouncementsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];

  searchQuery: string = '';
  sortBy: string = 'newest';
  filterStatus: string = 'all';
  showOnlyMine: boolean = false;
  productStatuses = ['AVAILABLE', 'RESERVED', 'UNAVAILABLE', 'EXPIRED'];

  currentPage: number = 1;
  pageSize: number = 9;
  totalPages: number = 1;

  showAnnouncementModal: boolean = false;
  showDeleteModal: boolean = false;

  isLoading: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  errorMessage: string = '';

  editingAnnouncement: AnnouncementRequest | null = null;
  announcementToDelete: AnnouncementRequest | null = null;

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnnouncements(): void {
    this.isLoading = true;

    this.announcementService.getAnnouncements()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          this.announcements = data;
          this.applyFilters();
          this.calculateTotalPages();
         //  this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load announcements';
          this.notificationService.error('Error loading announcements. Please try again later.');
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
    console.log(`${imagePath}`);

    if (imagePath.startsWith('/api/')) {

      const path = imagePath.startsWith('/api/') ? imagePath.substring(4) : imagePath;
      console.log(`${environment.apiUrlDash}${path}`);
      return `${environment.apiUrlDash}${path}`;
    }

    return `${environment.apiUrlDash}${imagePath}`;
  }


  applyFilters(): void {
    let filtered = [...this.announcements];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.products?.some(product =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        )
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(item =>
        item.products?.some(product => product.status === this.filterStatus)
      );
    }

    if (this.showOnlyMine) {
      filtered = filtered.filter(item => this.isOwner(item));
    }

    if (this.sortBy === 'newest') {
      filtered.sort((a, b) => {
        const dateA = a.postedDate ? new Date(a.postedDate) : new Date(0);
        const dateB = b.postedDate ? new Date(b.postedDate) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (this.sortBy === 'oldest') {
      filtered.sort((a, b) => {
        const dateA = a.postedDate ? new Date(a.postedDate) : new Date(0);
        const dateB = b.postedDate ? new Date(b.postedDate) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (this.sortBy === 'product') {
      filtered.sort((a, b) => {
        const nameA = a.products?.[0]?.name?.toLowerCase() || '';
        const nameB = b.products?.[0]?.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
    }

    this.filteredAnnouncements = filtered;
    this.calculateTotalPages();
    this.currentPage = 1;
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredAnnouncements.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  isOwner(announcement: Announcement): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    return announcement.user?.id === currentUser.id;
  }

  toggleMyAnnouncements(): void {
    this.showOnlyMine = !this.showOnlyMine;
    this.applyFilters();
  }

  openAddAnnouncementModal(): void {
    this.editingAnnouncement = null;
    this.showAnnouncementModal = true;
  }

  openEditAnnouncementModal(announcement: AnnouncementRequest): void {
    this.announcementService.getAnnouncementById(announcement.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fullAnnouncement) => {
          if (!fullAnnouncement) {
            this.notificationService.error('Announcement not found');
            return;
          }

          this.editingAnnouncement = fullAnnouncement;
          this.showAnnouncementModal = true;
        },
        error: () => {
          this.notificationService.error('Error loading Announcement');
        }
      });
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    this.editingAnnouncement = null;
  }

  saveAnnouncement(announcement: AnnouncementRequest): void {
    this.isSaving = true;

    let request;
    if (this.editingAnnouncement && announcement.id) {
      request = this.announcementService.updateAnnouncement(announcement.id, announcement);
    } else {
      request = this.announcementService.createAnnouncement(announcement);
    }

    request.pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isSaving = false;
        if (this.cdr && !(this.cdr as ViewRef).destroyed) {
          this.cdr.detectChanges();
        }
      })
    ).subscribe({
      next: (response) => {
        this.closeAnnouncementModal();
        setTimeout(() => this.loadAnnouncements(), 300);
        this.refreshAnnouncements();
        this.notificationService.success(
          this.editingAnnouncement ? 'Announcement updated successfully' : 'Announcement created successfully',5000
        );
      },
      error: (error) => {
        console.error('Failed to save announcement:', error);
        this.notificationService.error(
          error.status === 413
            ? 'Image size is too large. Please use smaller images (max 5MB per image).'
            : 'Error saving announcement. Please try again later.'
        );
        this.closeAnnouncementModal();
      },
      complete: () => {
        if (this.isSaving) {
          this.isSaving = false;
        }
      }
    });
  }

  confirmDelete(announcement: AnnouncementRequest): void {
    this.announcementToDelete = announcement;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.announcementToDelete = null;
  }

  deleteAnnouncement(): void {
    if (!this.announcementToDelete) return;

    this.isDeleting = true;
    const safetyTimeout = setTimeout(() => {
      if (this.isDeleting) {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.notificationService.error('Delete operation timed out. Please try again.');
      }
    }, 10000);

    this.announcementService.deleteAnnouncement(this.announcementToDelete.id!)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          clearTimeout(safetyTimeout);
          this.isDeleting = false;
          this.showDeleteModal = false;
        })
      )
      .subscribe({
        next: () => {
          this.loadAnnouncements();
          this.notificationService.success('Announcement deleted successfully');
          this.announcementToDelete = null;
        },
        error: () => {
          this.notificationService.error('Error deleting announcement. Please try again later.');
        }
      });
  }

  handleLogin(): void {
    // Implement login logic
  }

  handleSignup(): void {
    // Implement signup logic
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  viewAnnouncementDetails(announcement: Announcement): void {
    this.router.navigate(['/announcements', announcement.id]);
  }
  refreshAnnouncements(): void {
    // Forcer une nouvelle requête
    this.announcementService.refreshAnnouncements().subscribe({
      next: (data) => {
        this.announcements = data;
        this.applyFilters();
        this.calculateTotalPages();
      },
      error: (error) => {
        console.error('Error refreshing announcements:', error);
      }
    });
  }

}
