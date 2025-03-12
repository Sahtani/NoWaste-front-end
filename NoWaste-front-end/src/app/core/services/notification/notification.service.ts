import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);

  constructor() { }

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, duration: number = 5000): void {
    const id = this.generateId();
    const notification: Notification = { id, type, message, duration };

    const currentNotifications = this.notifications.getValue();
    this.notifications.next([...currentNotifications, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, duration: number = 5000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration: number = 5000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration: number = 5000): void {
    this.show('info', message, duration);
  }

  dismiss(id: string): void {
    const currentNotifications = this.notifications.getValue();
    this.notifications.next(currentNotifications.filter(notification => notification.id !== id));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
