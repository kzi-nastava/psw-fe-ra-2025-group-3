import { Component, Input, OnInit } from '@angular/core';
import { CommentService } from './comment.service';
import { CommentDto, CommentCreateDto } from './comment.dto';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input() blogId: number; // ID bloga za koji prikazujemo komentare
  comments: CommentDto[] = [];
  newComment: string = '';

  constructor(private commentService: CommentService) {}

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    // Implementiraj metodu koja učitava komentare (ako backend podržava)
    this.commentService.getComments(this.blogId).subscribe(
      (comments) => {
        this.comments = comments;
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );
  }

  addComment() {
    if (this.newComment.trim()) {
      const commentCreateDto: CommentCreateDto = { text: this.newComment };
      this.commentService.addComment(this.blogId, commentCreateDto).subscribe(
        (comment) => {
          this.comments.push(comment); // Dodaj novi komentar u listu
          this.newComment = ''; // Resetuj polje
        },
        (error) => {
          console.error('Error adding comment:', error);
        }
      );
    }
  }

  editComment(commentId: number, newText: string) {
    const updatedComment: CommentCreateDto = { text: newText };
    this.commentService.editComment(this.blogId, commentId, updatedComment).subscribe(
      (updated) => {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
          comment.text = updated.text;
          comment.editedAt = updated.editedAt;
        }
      },
      (error) => {
        console.error('Error editing comment:', error);
      }
    );
  }

  deleteComment(commentId: number) {
    this.commentService.deleteComment(this.blogId, commentId).subscribe(
      () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      },
      (error) => {
        console.error('Error deleting comment:', error);
      }
    );
  }
}
