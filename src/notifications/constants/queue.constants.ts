export const NOTIFICATION_QUEUES = {
  NOTIFICATIONS: 'notifications',
} as const;

export const NOTIFICATION_JOBS = {
  CREATE_NOTIFICATION: 'create-notification',
} as const;

export const QUEUE_CONFIG = {
  MAX_WORKERS: 4,
  DEFAULT_ATTEMPTS: 3,
  DEFAULT_BACKOFF: {
    type: 'exponential' as const,
    delay: 2000,
  },
} as const;
