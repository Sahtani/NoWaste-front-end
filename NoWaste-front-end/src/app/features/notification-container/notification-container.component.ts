import { Component, OnInit } from '@angular/core';
import {NotificationService} from '../../core/services/notification/notification.service';
import {NotificationData} from '../../core/models/notification.model';
import {NotificationComponent} from '../notification/notification.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-notification-container',
  templateUrl: './notification-container.component.html',
  standalone: true,
  imports: [
    NotificationComponent,
    NgForOf
  ],
  styleUrls: ['./notification-container.component.scss']
})
export class NotificationContainerComponent implements OnInit {
  notifications: NotificationData[] = [];

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  removeNotification(notification: NotificationData): void {
    this.notificationService.removeNotification(notification);
  }
}
