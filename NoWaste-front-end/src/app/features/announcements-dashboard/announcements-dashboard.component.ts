import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AnnouncementService } from '../../core/services/announcement/announcement.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import {Announcement} from '../../core/models/announcement/announcement.model';
import {AuthService} from '../../core/services/authentication/auth.service';
import {AnnouncementFormComponent} from '../announcement-form/announcement-form.component';
import {NotificationComponent} from '../notification/notification.component';
import {HeaderComponent} from '../../layout/header/header.component';
import {FormsModule} from '@angular/forms';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, SlicePipe} from '@angular/common';
import {AnnouncementRequest} from '../../core/models/announcement-request.model';

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
  styleUrls: ['./announcements-dashboard.component.css']
})
export class AnnouncementsDashboardComponent implements OnInit {
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;

    this.announcementService.getAnnouncements()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          this.announcements = data;
          this.applyFilters();
          this.calculateTotalPages();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load announcements';
          this.notificationService.error('Error loading announcements. Please try again later.');
          console.error('Error loading announcements:', error);
        }
      });
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
    } else if (this.sortBy === 'title') {
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
    console.log('batat',announcement.user?.id);
    console.log('khizou',currentUser.id);
    return announcement.user?.id === currentUser.id ;
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
    console.log('Ouverture du modal pour l\'annonce ID:', announcement.id);

    this.announcementService.getAnnouncementById(announcement.id!).subscribe({
      next: (fullAnnouncement) => {

        if (!fullAnnouncement) {
          this.notificationService.error('Annonce introuvable');
          return;
        }

        if (!fullAnnouncement.products || !Array.isArray(fullAnnouncement.products)) {
          console.warn('Aucun produit trouvé dans l\'annonce');
        }

        this.editingAnnouncement = fullAnnouncement;
        this.showAnnouncementModal = true;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'annonce:', error);
        this.notificationService.error('Erreur lors du chargement de l\'annonce');
      }
    });
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    this.editingAnnouncement = null;
  }

  saveAnnouncement(announcement: AnnouncementRequest, productImages?: File[]): void {
    this.isSaving = true;
    console.log(this.authService.getCurrentUser());
    let request;
    if (this.editingAnnouncement && announcement.id) {
      request = this.announcementService.updateAnnouncement(announcement.id, announcement);
    } else {
      request = this.announcementService.createAnnouncement(announcement);
    }

    request.pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (response) => {
        console.log('Announcement saved successfully:', response);
        this.closeAnnouncementModal();
        setTimeout(() => this.loadAnnouncements(), 300);
        this.notificationService.success(
          this.editingAnnouncement ? 'Announcement updated successfully' : 'Announcement created successfully'
        );
      },
      error: (error) => {
        console.error('Error saving announcement:', error);
        if (error.error && error.error.message) {
          console.error('Server error message:', error.error.message);
        }
        this.notificationService.error(
          error.status === 413
            ? 'Image size is too large. Please use smaller images (max 5MB per image).'
            : 'Error saving announcement. Please try again later.'
        );
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

    this.announcementService.deleteAnnouncement(this.announcementToDelete.id!)
      .pipe(
        finalize(() => {
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
        error: (error) => {
          this.notificationService.error('Error deleting announcement. Please try again later.');
          console.error('Error deleting announcement:', error);
        }
      });
  }

  handleLogin(): void {
    console.log('Handle login');
  }

  handleSignup(): void {
    console.log('Handle signup');
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  viewAnnouncementDetails(announcement: Announcement): void {
    this.router.navigate(['/announcements', announcement.id]);
  }
}
