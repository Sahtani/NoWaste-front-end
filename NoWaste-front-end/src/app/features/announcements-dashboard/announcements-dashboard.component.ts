import {Component, OnInit} from '@angular/core';
import {AnnouncementService} from '../../core/services/announcement/announcement.service';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf, SlicePipe} from '@angular/common';
import {Announcement} from '../../core/models/announcement/announcement.model';
import {ProductStatus} from '../../core/models/product.model';
import {FormsModule} from '@angular/forms';
import {AnnouncementFormComponent} from '../announcement-form/announcement-form.component';
import {AnnouncementStatus} from '../../core/enum/AnnouncementStatus';
import {AuthService} from '../../core/services/authentication/auth.service';
import {Router} from '@angular/router';
import {HeaderComponent} from '../../layout/header/header.component';
import {NotificationService} from '../../core/services/notification/notification.service';
import {NotificationComponent} from '../notification/notification.component';

@Component({
  selector: 'app-announcements-dashboard',
  templateUrl: './announcements-dashboard.component.html',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    SlicePipe,
    AnnouncementFormComponent,
    DatePipe,
    CurrencyPipe,
    HeaderComponent,
    NotificationComponent
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
  myAnnouncements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  editingAnnouncement: Announcement | null = null;
  announcementToDelete: Announcement | null = null;
  showAddSuccessToast = false;
  // Pagination state
  currentPage = 1;
  pageSize = 9;
  totalPages = 1;

  // Filter state
  searchQuery = '';
  filterStatus = 'all';
  sortBy = 'newest';
  showOnlyMine = false;

  productStatuses = Object.values(ProductStatus);
  currentUserId?: number | null = null;

  showLoginModal = false;
  showSignupModal = false;

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  handleLogin(): void {
    this.showLoginModal = true;
  }

  handleSignup(): void {
    this.showSignupModal = true;
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.notificationService.info('Vous avez été déconnecté avec succès');
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id;
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.announcementService.getAnnouncements().subscribe({
      next: (data) => {
        console.log('Données reçues de l\'API:', data);
        this.announcements = data.filter(a => a.status === AnnouncementStatus.PENDING);
        // Charger les annonces de l'utilisateur actuel
        if (this.currentUserId) {
          this.myAnnouncements = data.filter(a => a.userId === this.currentUserId);
        }
        console.log('Annonces filtrées:', this.announcements);
        this.applyFilters();
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading announcements', error);
        this.isLoading = false;
        this.notificationService.error('Erreur lors du chargement des annonces');
      }
    });
  }

  applyFilters(): void {
    let filtered = this.showOnlyMine ? [...this.myAnnouncements] : [...this.announcements];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
          a.produits && a.produits.some(p =>
            p.name?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.location?.toLowerCase().includes(query)
          )
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(a =>
        a.produits && a.produits.some(p => p.status === this.filterStatus)
      );
    }

    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.postedDate || '').getTime() - new Date(a.postedDate || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.postedDate || '').getTime() - new Date(b.postedDate || '').getTime());
        break;
      case 'title':
        filtered.sort((a, b) => {
          const nameA = a.produits && a.produits[0] ? a.produits[0].name : '';
          const nameB = b.produits && b.produits[0] ? b.produits[0].name : '';
          return nameA.localeCompare(nameB);
        });
        break;
    }

    this.filteredAnnouncements = filtered;
    this.calculateTotalPages();
    this.goToPage(1);
  }

  toggleMyAnnouncements(): void {
    this.showOnlyMine = !this.showOnlyMine;
    this.applyFilters();
  }

  isOwner(announcement: Announcement): boolean {
    return this.currentUserId === announcement.userId;
  }

  // Modal Functions
  openAddAnnouncementModal(): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning('Veuillez vous connecter pour créer une annonce');
      this.showLoginModal = true;
      return;
    }
    this.editingAnnouncement = null;
    this.showAnnouncementModal = true;
  }

  openEditAnnouncementModal(announcement: Announcement): void {
    if (this.isOwner(announcement)) {
      this.editingAnnouncement = announcement;
      this.showAnnouncementModal = true;
    } else {
      this.notificationService.warning('Vous ne pouvez modifier que vos propres annonces');
    }
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    this.editingAnnouncement = null;
  }

  confirmDelete(announcement: Announcement): void {
    // Vérifier si l'utilisateur est le propriétaire avant de permettre la suppression
    if (this.isOwner(announcement)) {
      this.announcementToDelete = announcement;
      this.showDeleteModal = true;
    } else {
      this.notificationService.warning('Vous ne pouvez supprimer que vos propres annonces');
    }
  }

  cancelDelete(): void {
    this.announcementToDelete = null;
    this.showDeleteModal = false;
  }

  // CRUD Operations
  saveAnnouncement(announcementData: Announcement): void {
    this.isSaving = true;

    const formatDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return new Date().toISOString();
      if (dateStr.length === 10) return `${dateStr}T00:00:00`;
      return dateStr;
    };

    const payload = {
      title: announcementData.title || '',
      produits: announcementData.produits.map(p => ({
        id: p.id || null,
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.price || 0.0,
        quantity: p.quantity,
        expirationDate: formatDate(p.expirationDate),
        location: p.location,
        image: (p.image || "").substring(0, 254) || "https://exemple.com/images/default.jpg",
        status: p.status || "AVAILABLE",
        announcementId: announcementData.id || null
      }))
    };

    console.log('Payload envoyé:', payload);

    if (announcementData.id) {
      if (this.isOwner(announcementData)) {
        this.announcementService.updateAnnouncement(announcementData.id, payload).subscribe({
          next: (updatedAnnouncement) => {
            this.handleSuccessfulSave(updatedAnnouncement, 'Annonce mise à jour avec succès');
          },
          error: (error) => {
            console.error('Détails de l\'erreur:', error);
            this.handleSaveError(error);
          },
          complete: () => {
            this.isSaving = false;
          }
        });
      } else {
        this.notificationService.error('Vous ne pouvez mettre à jour que vos propres annonces');
        this.isSaving = false;
      }
    } else {
      this.announcementService.createAnnouncement(payload).subscribe({
        next: (newAnnouncement) => {
          this.handleSuccessfulSave(newAnnouncement, 'Annonce créée avec succès. Elle sera visible après approbation par un administrateur.');
        },
        error: (error) => {
          console.error('Détails de l\'erreur:', error);
          this.handleSaveError(error);
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }
  }

  deleteAnnouncement(): void {
    if (!this.announcementToDelete) return;

    if (this.isOwner(this.announcementToDelete)) {
      this.isDeleting = true;
      this.announcementService.deleteAnnouncement(this.announcementToDelete.id!).subscribe({
        next: () => {
          this.announcements = this.announcements.filter(a => a.id !== this.announcementToDelete?.id);
          this.myAnnouncements = this.myAnnouncements.filter(a => a.id !== this.announcementToDelete?.id);
          this.applyFilters();
          this.showDeleteModal = false;
          this.announcementToDelete = null;
          this.isDeleting = false;
          this.notificationService.success('Annonce supprimée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'annonce', error);
          this.isDeleting = false;
          this.notificationService.error('Erreur lors de la suppression de l\'annonce');
        }
      });
    } else {
      this.notificationService.error('Vous ne pouvez supprimer que vos propres annonces');
      this.showDeleteModal = false;
      this.announcementToDelete = null;
    }
  }

  private handleSuccessfulSave(announcement: Announcement, message: string): void {
    if (this.editingAnnouncement) {
      const index = this.announcements.findIndex(a => a.id === announcement.id);
      if (index !== -1) {
        this.announcements[index] = announcement;
      }

      const myIndex = this.myAnnouncements.findIndex(a => a.id === announcement.id);
      if (myIndex !== -1) {
        this.myAnnouncements[myIndex] = announcement;
      } else {
        this.myAnnouncements.unshift(announcement);
      }
    } else {
      this.myAnnouncements.unshift(announcement);

      if (announcement.status === AnnouncementStatus.APPROVED) {
        this.announcements.unshift(announcement);
      }
    }

    this.applyFilters();
    this.closeAnnouncementModal();
    this.isSaving = false;

    // Afficher la notification de succès
    this.notificationService.success(message);
  }

  private handleSaveError(error: any): void {
    console.error('Erreur lors de l\'enregistrement de l\'annonce', error);
    this.isSaving = false;
    this.notificationService.error('Erreur lors de l\'enregistrement de l\'annonce');
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
}
