// src/app/feature-modules/blog/blog.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Blog, BlogCreateDto, BlogUpdateDto, BlogStatus, BlogVoteDto, BlogVoteStateDto } from './model/blog.model';

export interface ImageUploadResponse {
  imageUrl: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private baseUrl = environment.apiHost + 'blog';
  private imageUploadUrl = environment.apiHost + 'images';

  constructor(private http: HttpClient) { }

  getMyBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.baseUrl}/my-blogs`);
  }

  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.baseUrl}/all`);
  }

  getBlogById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/${id}`);
  }

  createBlog(blog: BlogCreateDto): Observable<Blog> {
    return this.http.post<Blog>(this.baseUrl, blog);
  }

  updateBlog(id: number, blog: BlogUpdateDto): Observable<Blog> {
    return this.http.put<Blog>(`${this.baseUrl}/${id}`, blog);
  }

  // NOVA METODA - Mijenja status
  changeStatus(id: number, status: BlogStatus): Observable<Blog> {
    return this.http.patch<Blog>(`${this.baseUrl}/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getVoteState(id: number): Observable<BlogVoteStateDto> {
    return this.http.get<BlogVoteStateDto>(`${this.baseUrl}/${id}/vote`);
  }

  vote(id: number, isUpvote: boolean): Observable<BlogVoteStateDto> {
    const body: BlogVoteDto = { blogId: id, isUpvote };
    return this.http.post<BlogVoteStateDto>(`${this.baseUrl}/${id}/vote`, body);
  }

  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImageUploadResponse>(`${this.imageUploadUrl}/upload`, formData);
  }

  deleteUploadedImage(fileName: string): Observable<void> {
    return this.http.delete<void>(`${this.imageUploadUrl}/${fileName}`);
  }

  // Helper funkcije za status
  getStatusLabel(status: BlogStatus): string {
    switch (status) {
      case BlogStatus.Draft: return 'Draft';
      case BlogStatus.Published: return 'Published';
      case BlogStatus.Archived: return 'Archived';
      default: return 'Unknown';
    }
  }

  getStatusColor(status: BlogStatus): string {
    switch (status) {
      case BlogStatus.Draft: return 'warn';
      case BlogStatus.Published: return 'primary';
      case BlogStatus.Archived: return 'accent';
      default: return '';
    }
  }

  canEdit(status: BlogStatus): boolean {
    return status !== BlogStatus.Archived;
  }

  canEditTitle(status: BlogStatus): boolean {
    return status === BlogStatus.Draft;
  }

  canEditImages(status: BlogStatus): boolean {
    return status === BlogStatus.Draft;
  }


  getBlogsByIds(ids: number[]) {
  return this.http.post<Blog[]>(
    `${this.baseUrl}/recommended`,
    { blogIds: ids }
  );
}
}