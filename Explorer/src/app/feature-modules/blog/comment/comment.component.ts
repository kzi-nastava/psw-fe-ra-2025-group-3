import { Component, Input, OnInit } from '@angular/core';
import { CommentService } from './comment.service';
import { CommentDto, CommentCreateDto } from './comment.dto';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  @Input() blogId!: number;

  comments: CommentDto[] = [];
  newComment = '';
  loading = false;

  // EDIT STATE
  editingCommentId: number | null = null;
  editText = '';
  isSavingEdit = false;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    if (!this.blogId) {
      console.error('CommentComponent: blogId is missing');
      return;
    }
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.commentService.getComments(this.blogId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading comments', err);
        this.loading = false;
      }
    });
  }

  addComment(): void {
    if (!this.newComment.trim()) return;

    const dto: CommentCreateDto = { text: this.newComment };

    this.commentService.addComment(this.blogId, dto).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newComment = '';
      },
      error: (err) => {
        console.error('Error adding comment', err);
      }
    });
  }

  startEdit(comment: CommentDto): void {
    this.editingCommentId = comment.id;
    this.editText = comment.text;
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editText = '';
    this.isSavingEdit = false;
  }

  saveEdit(commentId: number): void {
    const text = this.editText.trim();
    if (!text) return;

    this.isSavingEdit = true;

    const dto: CommentCreateDto = { text };

    this.commentService.editComment(this.blogId, commentId, dto).subscribe({
      next: (updated) => {
        const existing = this.comments.find(c => c.id === commentId);
        if (existing) {
          existing.text = updated.text;
          existing.editedAt = updated.editedAt;
        }

        this.isSavingEdit = false;
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error editing comment', err);
        this.isSavingEdit = false;
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Delete this comment?')) return;

    this.commentService.deleteComment(this.blogId, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);

        // ako obrišeš komentar koji je bio u edit modu
        if (this.editingCommentId === commentId) this.cancelEdit();
      },
      error: (err) => {
        console.error('Error deleting comment', err);
      }
    });
  }

  getEditedLabel(c: CommentDto): string {
    if (!c.editedAt) return '';
    return ` · Edited: ${new Date(c.editedAt).toLocaleString()}`;
  }
}
