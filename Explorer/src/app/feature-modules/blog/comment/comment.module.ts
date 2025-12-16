import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentComponent } from './comment.component';

@NgModule({
  declarations: [CommentComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [CommentComponent]
})
export class CommentModule {}
