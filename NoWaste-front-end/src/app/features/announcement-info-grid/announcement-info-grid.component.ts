import { Component, Input } from '@angular/core';
import { Announcement } from '../../core/models/announcement/announcement.model';
import { NgFor, NgIf, DatePipe } from '@angular/common';

@Component({
  selector: 'app-announcement-info-grid',
  standalone: true,
  template: `
    <div class="grid grid-cols-2 gap-2 mt-3">
      <!-- Category -->
      <div class="flex items-center">
        <svg class="w-4 h-4 text-[#264653]/60 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
        <span class="text-xs text-[#264653]/70">
          {{ getFirstProduct()?.category || 'Uncategorized' }}
        </span>
      </div>

      <!-- Location -->
      <div class="flex items-center">
        <svg class="w-4 h-4 text-[#264653]/60 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span class="text-xs text-[#264653]/70">
          {{ getFirstProduct()?.location || 'No location' }}
        </span>
      </div>

      <!-- Quantity -->
      <div class="flex items-center">
        <svg class="w-4 h-4 text-[#264653]/60 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
        </svg>
        <span class="text-xs text-[#264653]/70">
          {{ getFirstProduct()?.quantity || 0 }} available
        </span>
      </div>

      <!-- Expiry date -->
      <div class="flex items-center">
        <svg class="w-4 h-4 text-[#264653]/60 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-xs text-[#264653]/70">
          Expires: {{ getExpiryDateText() }}
        </span>
      </div>
    </div>
  `
})
export class AnnouncementInfoGridComponent {
  @Input() announcement: Announcement | undefined;

  getFirstProduct() {
    return this.announcement?.produits?.[0];
  }

  getExpiryDateText(): string {
    const expiryDate = this.getFirstProduct()?.expiryDate;
    if (!expiryDate) return 'No expiry date';

    // Use DatePipe directly in the component
    return new DatePipe('en-US').transform(expiryDate, 'MMM d, y') || 'No expiry date';
  }

}
