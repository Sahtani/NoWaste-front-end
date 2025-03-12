import { Component } from '@angular/core';
import {Announcement} from '../../core/models/announcement/announcement.model';
import {AnnouncementService} from '../../core/services/announcement/announcement.service';

@Component({
  selector: 'app-admindashboard',
  imports: [],
  templateUrl: './admindashboard.component.html',
  styleUrl: './admindashboard.component.css'
})
export class AdmindashboardComponent {

  pendingAnnouncements: Announcement[] = [];
  isLoading = true;
  rejectionReason = '';
  selectedAnnouncement: Announcement | null = null;
  showRejectModal = false;

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.loadPendingAnnouncements();
  }

  loadPendingAnnouncements(): void {
    this.isLoading = true;
    this.announcementService.getPendingAnnouncements().subscribe({
      next: (data) => {
        this.pendingAnnouncements = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending announcements', error);
        this.isLoading = false;
      }
    });
  }

  approveAnnouncement(id: number): void {
    this.announcementService.approveAnnouncement(id).subscribe({
      next: () => {
        this.loadPendingAnnouncements();
        alert('Annonce approuvée avec succès');
      },
      error: (error) => {
        console.error('Error approving announcement', error);
        alert('Erreur lors de l\'approbation de l\'annonce');
      }
    });
  }

  openRejectModal(announcement: Announcement): void {
    this.selectedAnnouncement = announcement;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedAnnouncement = null;
  }

  rejectAnnouncement(): void {
    if (!this.selectedAnnouncement || !this.rejectionReason) {
      alert('Veuillez fournir une raison de rejet');
      return;
    }

    this.announcementService.rejectAnnouncement(
      this.selectedAnnouncement.id!,
      this.rejectionReason
    ).subscribe({
      next: () => {
        this.closeRejectModal();
        this.loadPendingAnnouncements();
        alert('Annonce rejetée avec succès');
      },
      error: (error) => {
        console.error('Error rejecting announcement', error);
        alert('Erreur lors du rejet de l\'annonce');
      }
    });
  }

}
