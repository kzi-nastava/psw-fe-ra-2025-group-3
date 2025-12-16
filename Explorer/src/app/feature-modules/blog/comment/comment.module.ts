import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentService } from './comment.service';
import { CommentComponent } from './comment.component';

@NgModule({
  declarations: [CommentComponent],
  imports: [CommonModule],
  exports: [CommentComponent],
})
export class CommentModule {}
