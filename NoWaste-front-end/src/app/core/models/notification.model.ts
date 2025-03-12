
export interface NotificationData {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
