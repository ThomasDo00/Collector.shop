/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // in ms, default 5000
}

/**
 * App notification types
 */
export type NotificationType =
  | 'order_update'
  | 'new_message'
  | 'price_change'
  | 'new_review'
  | 'article_validated'
  | 'article_rejected'
  | 'payment_received'
  | 'system';

/**
 * App notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  imageUrl?: string;
  createdAt: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    newMessages: boolean;
    priceAlerts: boolean;
    marketing: boolean;
  };
  push: {
    orderUpdates: boolean;
    newMessages: boolean;
    priceAlerts: boolean;
  };
}
