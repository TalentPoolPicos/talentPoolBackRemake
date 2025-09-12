import { NotificationType } from '@prisma/client';

export interface NotificationJobData {
  type: NotificationType;
  title: string;
  message: string;
  userId: number;
  metadata?: any;
  priority?: number;
  expiresAt?: Date;
  actionUrl?: string;
  actionType?: string;
  actionData?: any;
  relatedJobId?: number;
  relatedApplicationId?: number;
  relatedUserId?: number;
}

export interface NotificationJobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: string;
    delay: number;
  };
}

export interface NotificationResult {
  success: boolean;
  notificationId?: number;
  error?: string;
}
