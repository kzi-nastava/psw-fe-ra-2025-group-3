export class CommentDto {
  id: number;
  authorId: number;
  text: string;
  createdAt: string;
  editedAt: string | null;
}

export class CommentCreateDto {
  text: string;
}
