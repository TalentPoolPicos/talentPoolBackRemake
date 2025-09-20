export interface JobPublishedNotificationData {
  jobId: number;
  uuid: string;
  jobTitle: string;
  enterpriseId: number;
  enterpriseName: string;
  enterpriseUserId: number;
  jobLocation?: string;
  jobBody?: string;
}

export interface JobPublishedNotificationResult {
  success: boolean;
  notificationsSent: number;
  error?: string;
}
