import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Blog, BlogCreateDto, BlogUpdateDto } from './model/blog.model';

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

  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImageUploadResponse>(`${this.imageUploadUrl}/upload`, formData);
  }

  deleteUploadedImage(fileName: string): Observable<void> {
    return this.http.delete<void>(`${this.imageUploadUrl}/${fileName}`);
  }
}