export interface NotificationDto {
  id: number;
  recipientId: number;
  type: NotificationType;
  relatedEntityId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface UnreadCountDto {
  count: number;
}

export interface MarkAllReadResultDto {
  updatedCount: number;
}

export enum NotificationType {
  NewMessage = 0,
  ProblemResolved = 1,
  ProblemUnresolved = 2,
  DeadlineSet = 3,
  WalletTopUp = 4,
  TourPurchased = 5,
  BundlePurchase = 6,
  TourOnSale = 7,
  Achievement = 8,
  TourRewardAc = 9
}
