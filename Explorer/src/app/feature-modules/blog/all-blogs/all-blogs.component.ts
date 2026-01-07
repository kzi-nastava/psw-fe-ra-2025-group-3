// src/app/feature-modules/blog/all-blogs/all-blogs.component.ts

import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BlogService } from '../blog.service';
import { Blog, BlogStatus } from '../model/blog.model';

@Component({
  selector: 'app-all-blogs',
  templateUrl: './all-blogs.component.html',
  styleUrls: ['./all-blogs.component.css']
})
export class AllBlogsComponent implements OnInit {
  blogs: Blog[] = [];
  isLoading: boolean = false;

  constructor(
    private blogService: BlogService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllBlogs();
  }

  loadAllBlogs(): void {
    this.isLoading = true;
    this.blogService.getAllBlogs().subscribe({
      next: (blogs) => {
        this.blogs = blogs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.showError('Failed to load blogs');
        this.isLoading = false;
      }
    });
  }

  viewBlog(blogId: number): void {
    this.router.navigate(['/blogs', blogId]);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getBlogStatus(status: BlogStatus): string {
    if (status == BlogStatus.Active) 
        return "ACTIVE";
    else if (status == BlogStatus.Famous) 
        return "FAMOUS";
    else if (status == BlogStatus.ReadOnly)
        return "READ-ONLY";
    else 
        return "";
  }

  truncateMarkdown(text: string, maxLength: number = 120): string {
    if (!text) return '';
    
    const plainText = text
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    
    if (plainText.length <= maxLength) {
      return text;
    }
    
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
    
    return finalText + '...';
  }

  getImageUrl(blog: Blog): string {
    if (blog.images && blog.images.length > 0) {
      return blog.images[0].imageUrl;
    }
    return 'https://via.placeholder.com/400x200?text=No+Image';
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}