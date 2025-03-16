import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AnnouncementService } from '../../core/services/announcement/announcement.service';
import { Announcement } from '../../core/models/announcement/announcement.model';
import { SlicePipe, DatePipe, NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/authentication/auth.service';
import { FormsModule } from '@angular/forms';
import {AnnouncementCardComponent} from '../announcement-card/announcement-card.component';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  standalone: true,
  imports: [
    SlicePipe,
    DatePipe,
    FormsModule,
    NgClass,
    NgIf,
    NgFor,
    AnnouncementCardComponent
  ],
  styleUrls: ['./announcement-list.component.css']
})
export class AnnouncementListComponent implements OnInit, OnChanges {
  @Input() filteredAnnouncements: Announcement[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<Announcement>();
  @Output() delete = new EventEmitter<Announcement>();
  @Output() create = new EventEmitter<void>();
  @Output() view = new EventEmitter<Announcement>();

  currentPage: number = 1;
  pageSize: number = 9;
  totalPages: number = 1;

  searchQuery: string = '';
  sortBy: string = 'newest';
  filterStatus: string = 'all';
  showOnlyMine: boolean = false;
  productStatuses: string[] = ['AVAILABLE', 'RESERVED', 'UNAVAILABLE', 'EXPIRED'];

  constructor(
    private router: Router,
    private announcementService: AnnouncementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.calculateTotalPages();
  }

  ngOnChanges(): void {
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredAnnouncements.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    // Limit to show max 5 pages for better UX
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page, last page, current page, and pages around current
      const currentPage = this.currentPage;

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= this.totalPages - 2) {
        // Near the end
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  isOwner(announcement: Announcement): boolean {
    return announcement.userId === this.authService.getCurrentUser()?.id;
  }

  viewItemDetails(announcement: Announcement): void {
    this.view.emit(announcement);
  }

  openAddAnnouncementModal(): void {
    this.create.emit();
  }

  openEditAnnouncementModal(announcement: Announcement): void {
    this.edit.emit(announcement);
  }

  confirmDelete(announcement: Announcement): void {
    this.delete.emit(announcement);
  }

  applyFilters(): void {
    // Logic to apply filters and emit event to parent component
  }

  toggleMyAnnouncements(): void {
    this.showOnlyMine = !this.showOnlyMine;
    this.applyFilters();
  }
}
