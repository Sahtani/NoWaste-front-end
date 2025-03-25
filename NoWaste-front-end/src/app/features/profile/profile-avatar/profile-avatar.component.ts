
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { finalize } from 'rxjs';
import {UserProfileService} from '../../../core/services/user/user-profile.service';

@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.css']
})
export class ProfileAvatarComponent {
  @Input() currentAvatar: string | undefined;
  @Output() avatarUpdated = new EventEmitter<string>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  avatarPreview: string | null = null;
  isUploading = false;

  constructor(
    private userProfileService: UserProfileService,
    private notificationService: NotificationService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validation
      if (!file.type.startsWith('image/')) {
        this.notificationService.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        this.notificationService.error('Image size should not exceed 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Upload
      this.uploadAvatar(file);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  uploadAvatar(file: File): void {
    this.isUploading = true;

    this.userProfileService.updateAvatar(file)
      .pipe(finalize(() => this.isUploading = false))
      .subscribe({
        next: (response) => {
          this.avatarUpdated.emit(response.imageUrl);
          this.avatarPreview = null;
        },
        error: (error) => {
          console.error('Error uploading avatar:', error);
          this.notificationService.error('Failed to upload profile picture');
          this.avatarPreview = null;
        }
      });
  }
}
