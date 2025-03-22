import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgFor, NgClass } from '@angular/common';
import { NotificationService, Notification } from '../../core/services/notification/notification.service';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  animations: [
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ],
  standalone: true,
  imports: [NgFor, NgClass]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription | null = null;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(
      notifications => {
        this.notifications = notifications;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info':
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getNotificationClasses(notification: Notification): any {
    const baseClasses = 'rounded-lg p-4 mb-3 flex items-center shadow-lg border-l-4 ';

    switch (notification.type) {
      case 'success':
        return baseClasses + 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return baseClasses + 'bg-red-100 border-red-500 text-red-700';
      case 'warning':
        return baseClasses + 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'info':
      default:
        return baseClasses + 'bg-blue-100 border-blue-500 text-blue-700';
    }
  }
}
