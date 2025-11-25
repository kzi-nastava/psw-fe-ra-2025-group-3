// src/app/feature-modules/blog/blog.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Blog, BlogCreateDto, BlogUpdateDto } from './model/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private baseUrl = environment.apiHost + 'blog';

  constructor(private http: HttpClient) { }

  /**
   * Dohvata sve blogove trenutno ulogovanog korisnika
   */
  getMyBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.baseUrl}/my-blogs`);
  }

  /**
   * Kreira novi blog
   */
  createBlog(blog: BlogCreateDto): Observable<Blog> {
    return this.http.post<Blog>(this.baseUrl, blog);
  }

  /**
   * Ažurira postojeći blog
   */
  updateBlog(id: number, blog: BlogUpdateDto): Observable<Blog> {
    return this.http.put<Blog>(`${this.baseUrl}/${id}`, blog);
  }

  /**
   * Briše blog (ako backend podržava - trenutno nije implementirano)
   */
  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}