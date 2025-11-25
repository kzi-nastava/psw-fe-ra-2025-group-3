

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


  getMyBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.baseUrl}/my-blogs`);
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
}