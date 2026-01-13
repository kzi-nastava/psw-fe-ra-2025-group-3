export interface Sale {
  id: number;
  tourIds: number[];
  startDate: Date;
  endDate: Date;
  discountPercentage: number;
  authorId: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SaleCreateDto {
  tourIds: number[];
  startDate: Date;
  endDate: Date;
  discountPercentage: number;
}

export interface SaleUpdateDto {
  id: number;
  tourIds: number[];
  startDate: Date;
  endDate: Date;
  discountPercentage: number;
}
