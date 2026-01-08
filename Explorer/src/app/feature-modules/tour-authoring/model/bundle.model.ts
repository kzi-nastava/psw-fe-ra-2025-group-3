export interface Bundle {
  id: number;
  name: string;
  price: number;
  status: BundleStatus;
  authorId: number;
  tourIds: number[];
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
  archivedAt?: Date;
}

export interface BundleWithTours {
  id: number;
  name: string;
  price: number;
  status: BundleStatus;
  authorId: number;
  tours: BundleTourInfo[];
  totalToursPrice: number;
  createdAt: Date;
}

export interface BundleTourInfo {
  id: number;
  name: string;
  price: number;
  status: number;
}

export interface BundleCreateDto {
  name: string;
  price: number;
  tourIds: number[];
}

export interface BundleUpdateDto {
  id: number;
  name: string;
  price: number;
  tourIds: number[];
}

export enum BundleStatus {
  Draft = 0,
  Published = 1,
  Archived = 2
}