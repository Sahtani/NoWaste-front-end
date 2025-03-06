import { Component, OnInit } from '@angular/core';
import { AnnouncementService } from '../../core/services/announcement.service';
import {DatePipe, NgClass, NgForOf, NgIf, SlicePipe} from '@angular/common';
import {Announcement} from '../../core/models/announcement/announcement.model';
import {ProductStatus} from '../../core/models/product.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-announcements-dashboard',
  templateUrl: './announcements-dashboard.component.html',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    SlicePipe
  ],
  providers: [DatePipe],
  styleUrls: ['./announcements-dashboard.component.css']
})
export class AnnouncementsDashboardComponent implements OnInit {
  // UI state
  isLoading = true;
  isSaving = false;
  isDeleting = false;
  showAnnouncementModal = false;
  showDeleteModal = false;

  // Data state
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  editingAnnouncement: Announcement | null = null;
  announcementToDelete: Announcement | null = null;

  // Pagination state
  currentPage = 1;
  pageSize = 9;
  totalPages = 1;

  // Filter state
  searchQuery = '';
  filterStatus = 'all';
  sortBy = 'newest';

  productStatuses = Object.values(ProductStatus);

  constructor(
    private announcementService: AnnouncementService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.announcementService.getAnnouncements().subscribe({
      next: (data) => {
        this.announcements = data;
        this.applyFilters();
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading announcements', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.announcements];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.produits.some(p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
        )
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(a =>
        a.produits.some(p => p.status === this.filterStatus)
      );
    }

    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.produits[0].name.localeCompare(b.produits[0].name));
        break;
    }

    this.filteredAnnouncements = filtered;
    this.calculateTotalPages();
    this.goToPage(1);
  }

  // Modal Functions
  openAddAnnouncementModal(): void {
    this.editingAnnouncement = null;
    this.showAnnouncementModal = true;
  }

  openEditAnnouncementModal(announcement: Announcement): void {
    this.editingAnnouncement = announcement;
    this.showAnnouncementModal = true;
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    this.editingAnnouncement = null;
  }
  confirmDelete(announcement: Announcement): void {
    this.announcementToDelete = announcement;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.announcementToDelete = null;
    this.showDeleteModal = false;
  }

  // CRUD Operations
 /* saveAnnouncement(announcementData: Announcement): void {
    this.isSaving = true;

    if (announcementData.id) {
      this.announcementService.updateAnnouncement(announcementData.id, announcementData).subscribe({
        next: (updatedAnnouncement) => {
          this.handleSuccessfulSave(updatedAnnouncement, 'Annonce mise à jour avec succès');
        },
        error: (error) => this.handleSaveError(error)
      });
    } else {

      this.announcementService.createAnnouncement(announcementData).subscribe({
        next: (newAnnouncement) => {
          this.handleSuccessfulSave(newAnnouncement, 'Annonce créée avec succès');
        },
        error: (error) => this.handleSaveError(error)
      });
    }
  }
*/
  deleteAnnouncement(): void {
    if (!this.announcementToDelete) return;

    this.isDeleting = true;
    this.announcementService.deleteAnnouncement(this.announcementToDelete.id!).subscribe({
      next: () => {
        this.announcements = this.announcements.filter(a => a.id !== this.announcementToDelete?.id);
        this.applyFilters();
        this.showDeleteModal = false;
        this.announcementToDelete = null;
        this.isDeleting = false;
        // Show success notification
        alert('Annonce supprimée avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de l\'annonce', error);
        this.isDeleting = false;
        // Show error notification
        alert('Erreur lors de la suppression de l\'annonce');
      }
    });
  }

  private handleSuccessfulSave(announcement: Announcement, message: string): void {
    if (this.editingAnnouncement) {
      // Update in local array
      const index = this.announcements.findIndex(a => a.id === announcement.id);
      if (index !== -1) {
        this.announcements[index] = announcement;
      }
    } else {
      // Add to local array
      this.announcements.unshift(announcement);
    }

    this.applyFilters();
    this.closeAnnouncementModal();
    this.isSaving = false;

    // Show success notification
    alert(message);
  }

  private handleSaveError(error: any): void {
    console.error('Erreur lors de l\'enregistrement de l\'annonce', error);
    this.isSaving = false;
    // Show error notification
    alert('Erreur lors de l\'enregistrement de l\'annonce');
  }

  // Pagination methods
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
}
