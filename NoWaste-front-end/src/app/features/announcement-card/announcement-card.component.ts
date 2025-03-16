import { Component, Input, Output, EventEmitter } from '@angular/core';
import {Announcement} from '../../core/models/announcement/announcement.model';
import {NgIf} from '@angular/common';
import {StatusBadgesComponent} from '../status-badges/status-badges.component';
import {SocialIndicatorsComponent} from '../social-indicators/social-indicators.component';
import {AnnouncementInfoGridComponent} from '../announcement-info-grid/announcement-info-grid.component';

@Component({
  selector: 'app-announcement-card',
  templateUrl: './announcement-card.component.html',
  imports: [
    NgIf,
    StatusBadgesComponent,
    SocialIndicatorsComponent,
    AnnouncementInfoGridComponent
  ],
  styleUrls: ['./announcement-card.component.css']
})
export class AnnouncementCardComponent {
  @Input() announcement: Announcement | null = null;
  @Input() isOwner: boolean = false;

  @Output() edit = new EventEmitter<Announcement>();
  @Output() delete = new EventEmitter<Announcement>();
  @Output() view = new EventEmitter<Announcement>();

  // Helper methods to safely access properties
  getFirstProduct() {
    return this.announcement?.produits?.[0];
  }

  getProductArray() {
    return this.announcement?.produits || [];
  }

  // Helper methods for event handlers
  onEdit() {
    if (this.announcement) {
      this.edit.emit(this.announcement);
    }
  }

  onDelete() {
    if (this.announcement) {
      this.delete.emit(this.announcement);
    }
  }

  onView() {
    if (this.announcement) {
      this.view.emit(this.announcement);
    }
  }
}
