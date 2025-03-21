import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private destroy$ = new Subject<void>();
  private timeoutMap: Map<string, any> = new Map();

  constructor() { }

  ngOnDestroy(): void {
    this.timeoutMap.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutMap.clear();

    this.notifications.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable().pipe(
      takeUntil(this.destroy$)
    );
  }

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, duration: number = 5000): void {
    const id = this.generateId();
    const notification: Notification = { id, type, message, duration };

    const currentNotifications = this.notifications.getValue();
    this.notifications.next([...currentNotifications, notification]);

    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        this.dismiss(id);
        this.timeoutMap.delete(id);
      }, duration);

      this.timeoutMap.set(id, timeoutId);
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

    if (this.timeoutMap.has(id)) {
      clearTimeout(this.timeoutMap.get(id));
      this.timeoutMap.delete(id);
    }
  }

  clearAll(): void {

    this.timeoutMap.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutMap.clear();

    this.notifications.next([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
