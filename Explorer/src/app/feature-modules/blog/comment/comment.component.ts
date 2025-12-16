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

  deleteComment(commentId: number): void {
    if (!confirm('Delete this comment?')) return;

    this.commentService.deleteComment(this.blogId, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      },
      error: (err) => {
        console.error('Error deleting comment', err);
      }
    });
  }
}
