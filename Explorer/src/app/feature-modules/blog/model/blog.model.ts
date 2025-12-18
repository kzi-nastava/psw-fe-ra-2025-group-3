// src/app/feature-modules/blog/model/blog.model.ts

export enum BlogStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
  Active = 3,
  Famous = 4,
  ReadOnly = 5
}

export interface Blog {
  id: number;
  title: string;
  description: string;
  creationDate: Date;
  lastModifiedDate?: Date; 
  authorId: number;
  status: BlogStatus; 
  images: BlogImage[];
}

export interface BlogImage {
  id: number;
  imageUrl: string;
  blogId: number;
}

export interface BlogCreateDto {
  title: string;
  description: string;
  images: BlogImageCreateDto[];
}

export interface BlogImageCreateDto {
  imageUrl: string;
}

export interface BlogUpdateDto {
  title: string;
  description: string;
  images: BlogImageCreateDto[];
}

export interface BlogStatusUpdateDto {
  status: BlogStatus;
}

export interface BlogVoteDto {
  blogId: number;
  isUpvote: boolean;
}

export interface BlogVoteStateDto {
  blogId: number;
  isUpvote: boolean | null;
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  blogStatus: number;
}