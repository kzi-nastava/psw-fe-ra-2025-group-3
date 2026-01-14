export interface Coupon {
  id: number;
  code: string;
  discountPercentage: number;
  expiryDate?: Date;
  tourId?: number;
  authorId: number;
  createdAt: Date;
}

export interface CouponCreateDto {
  discountPercentage: number;
  expiryDate?: string; // ISO string format
  tourId?: number;
}

export interface CouponUpdateDto {
  discountPercentage: number;
  expiryDate?: string; // ISO string format
  tourId?: number;
}

export interface CouponValidationDto {
  code: string;
  tourId: number;
  tourIds?: number[]; // Lista tour ID-jeva iz korpe (opciono)
}

export interface CouponValidationResultDto {
  isValid: boolean;
  message: string;
  discountPercentage: number;
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
  appliedToTourId?: number; // ID ture na koju se primenjuje popust
}
