export interface ClubImageDto {
  id: number;
  imageUrl: string;
  uploadedAt: string;
}

export interface ClubDto {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  status: string;
  memberIds: number[];
  featuredImageId?: number | null;
  featuredImage?: ClubImageDto | null;
  galleryImages: ClubImageDto[];
}

export interface ClubCreateDto {
  name: string;
  description: string;
  featuredImageUrl: string;
  galleryImageUrls?: string[] | null;
}

export interface ClubUpdateDto {
  name?: string | null;
  description?: string | null;
  promoteGalleryImageId?: number | null;
  newFeaturedImageUrl?: string | null;
  newGalleryImageUrls?: string[] | null;
  removedGalleryImageIds?: number[] | null;
}

export interface ClubJoinRequestDto {
  id: number;
  touristId: number;
  clubId: number;
  requestedAt: string;
}

export interface ClubJoinRequestByTouristDto {
    id: number;
    clubId: number;
    touristId: number;
    username: string;
    email: string;
    requestedAt: string;
}
