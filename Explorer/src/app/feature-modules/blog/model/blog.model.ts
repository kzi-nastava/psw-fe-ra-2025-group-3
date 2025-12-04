export interface Blog {
  id: number;
  title: string;
  description: string;
  creationDate: Date;
  authorId: number;
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
}