export enum BonusType {
  AC100 = 1,
  AC250 = 2,
  AC500 = 3,
  Discount10 = 4,
  Discount20 = 5,
  Discount30 = 6
}

export interface WelcomeBonus {
  id: number;
  personId: number;
  bonusType: BonusType;
  value: number;
  isUsed: boolean;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}
