import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentDto, CommentCreateDto } from './comment.dto';
import { environment } from 'src/env/environment';




@Injectable({
  providedIn: 'root',
})
export class CommentService {

 
  private apiUrl = `${environment.apiHost}blog`;


  constructor(private http: HttpClient) {}

  addComment(blogId: number, comment: CommentCreateDto): Observable<CommentDto> {
    return this.http.post<CommentDto>(`${this.apiUrl}/${blogId}/comments`, comment);
  }

  editComment(blogId: number, commentId: number, comment: CommentCreateDto): Observable<CommentDto> {
    return this.http.put<CommentDto>(`${this.apiUrl}/${blogId}/comments/${commentId}`, comment);
  }
  getComments(blogId: number): Observable<CommentDto[]> {
  return this.http.get<CommentDto[]>(
    `${this.apiUrl}/${blogId}/comments`
  );
}

  deleteComment(blogId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blogId}/comments/${commentId}`);
  }
}
