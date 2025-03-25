import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { finalize } from 'rxjs';
import {User} from '../../../core/models/user/user.model';
import {UserProfileService} from '../../../core/services/user/user-profile.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() profileUpdated = new EventEmitter<User>();

  profileForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: [this.user?.name || '', [Validators.required]],
      phone: [this.user?.phone || ''],
      address: [this.user?.address || ''],
      bio: [this.user?.bio || '']
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    if (!this.user || !this.user.id) {
      this.notificationService.error('User information is not available');
      return;
    }

    this.isSubmitting = true;

    this.userProfileService.updateUserProfile(this.user.id, this.profileForm.value)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (updatedUser) => {
          this.profileUpdated.emit(updatedUser);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.notificationService.error('Failed to update profile');
        }
      });
  }
}
