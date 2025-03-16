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

  // Variables d'état
  isLoading: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  errorMessage: string = '';

  // Variables pour édition/suppression
  editingAnnouncement: Announcement | null = null;
  announcementToDelete: Announcement | null = null;

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

    // Filtre par recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.produits?.some(produit =>
          produit.name?.toLowerCase().includes(query) ||
          produit.description?.toLowerCase().includes(query)
        )
      );
    }

    // Filtre par statut
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(item =>
        item.produits?.some(produit => produit.status === this.filterStatus)
      );
    }

    // Filtre mes annonces
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
        const nameA = a.produits?.[0]?.name?.toLowerCase() || '';
        const nameB = b.produits?.[0]?.name?.toLowerCase() || '';
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

    return announcement.userId === currentUser.id;
  }

  toggleMyAnnouncements(): void {
    this.showOnlyMine = !this.showOnlyMine;
    this.applyFilters();
  }
  openAddAnnouncementModal(): void {
    this.editingAnnouncement = null;
    this.showAnnouncementModal = true;
  }

  openEditAnnouncementModal(announcement: Announcement): void {
    this.editingAnnouncement = { ...announcement };
    this.showAnnouncementModal = true;
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    this.editingAnnouncement = null;
  }

  saveAnnouncement(announcement: Announcement): void {
    this.isSaving = true;

    const request = this.editingAnnouncement
      ? this.announcementService.updateAnnouncement(announcement.id!, announcement)
      : this.announcementService.createAnnouncement(announcement);

    request.pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: () => {
        this.closeAnnouncementModal();
        this.loadAnnouncements();
        this.notificationService.success(
          this.editingAnnouncement ? 'Announcement updated successfully' : 'Announcement created successfully'
        );
      },
      error: (error) => {
        this.notificationService.error('Error saving announcement. Please try again later.');
        console.error('Error saving announcement:', error);
      }
    });
  }

  confirmDelete(announcement: Announcement): void {
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

  // Header actions
  handleLogin(): void {
    // Implement or delegate to auth service
    console.log('Handle login');
  }

  handleSignup(): void {
    // Implement or delegate to auth service
    console.log('Handle signup');
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Navigation vers la page de détails
  viewAnnouncementDetails(announcement: Announcement): void {
    this.router.navigate(['/announcements', announcement.id]);
  }
}
