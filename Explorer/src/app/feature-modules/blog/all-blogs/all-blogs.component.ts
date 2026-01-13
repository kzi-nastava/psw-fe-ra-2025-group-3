// src/app/feature-modules/blog/all-blogs/all-blogs.component.ts

import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BlogService } from '../blog.service';
import { Blog, BlogStatus } from '../model/blog.model';
import { ActivityService } from '../../activity/activity.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-all-blogs',
  templateUrl: './all-blogs.component.html',
  styleUrls: ['./all-blogs.component.css']
})
export class AllBlogsComponent implements OnInit {

  blogs: Blog[] = [];
  isLoading: boolean = false;

  // ⭐ NOVO – recommended
  recommendedBlogs: Blog[] = [];
  recommendedIds: number[] = [];

  @ViewChild('recommendedRow') recommendedRow!: ElementRef;

  constructor(
    private blogService: BlogService,
    private activityService: ActivityService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRecommendedBlogs();   // 👈 NOVO
    this.loadAllBlogs();
  }

  // =========================
  // ⭐ RECOMMENDED BLOGS
  // =========================
  loadRecommendedBlogs(): void {
    this.activityService.getRecommendedBlogIds(6).pipe(
      switchMap(ids => {
        if (!ids || ids.length === 0) {
          this.recommendedIds = [];
          return of([]);
        }

        this.recommendedIds = ids;
        return this.blogService.getBlogsByIds(ids);
      })
    ).subscribe({
      next: blogs => this.recommendedBlogs = blogs,
      error: () => this.recommendedBlogs = []
    });
  }

  scrollLeft(): void {
    this.recommendedRow?.nativeElement.scrollBy({
      left: -400,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {
    this.recommendedRow?.nativeElement.scrollBy({
      left: 400,
      behavior: 'smooth'
    });
  }

  // =========================
  // ALL BLOGS (postojeće)
  // =========================
  loadAllBlogs(): void {
    this.isLoading = true;
    this.blogService.getAllBlogs().subscribe({
      next: (blogs) => {
        // ⛔ izbaci preporučene iz glavne liste
        this.blogs = blogs.filter(b => !this.recommendedIds.includes(b.id));
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
