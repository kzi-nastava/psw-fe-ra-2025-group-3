// src/app/feature-modules/blog/blog-detail/blog-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BlogService } from '../blog.service';
import { Blog, BlogStatus, BlogVoteStateDto } from '../model/blog.model';
import { ActivityService } from '../../activity/activity.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  isLoading: boolean = true;
  currentImageIndex: number = 0;
  voteState: BlogVoteStateDto | null = null;

  // TODO: zameniti pravom autentikacijom
  isAuthenticated = true;

  isActive = false;
  isFamous = false;
  isPublished = false;
  isDraft = false;
  isReadOnly = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private snackBar: MatSnackBar,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    const blogIdParam = this.route.snapshot.paramMap.get('id');

    if (!blogIdParam) {
      this.showError('Invalid blog ID');
      this.goBack();
      return;
    }

    const blogId = Number(blogIdParam);

    this.loadBlog(blogId);
    this.loadVoteState(blogId);

    // ✅ ACTIVITY TRACKING – fire & forget
    this.activityService.trackBlogView(blogId).subscribe();
  }

  loadBlog(id: number): void {
    this.isLoading = true;

    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        this.blog = blog;
        this.isLoading = false;
        this.checkStatus();
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.showError('Failed to load blog');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  private checkStatus(): void {
    if (!this.blog) return;

    this.isActive = this.blog.status === BlogStatus.Active;
    this.isFamous = this.blog.status === BlogStatus.Famous;
    this.isPublished = this.blog.status === BlogStatus.Published;
    this.isDraft = this.blog.status === BlogStatus.Draft;
    this.isReadOnly = this.blog.status === BlogStatus.ReadOnly;
  }

  private loadVoteState(id: number): void {
    if (!this.isAuthenticated) return;

    this.blogService.getVoteState(id).subscribe({
      next: (state) => {
        this.voteState = state;

        if (this.blog) {
          this.blog.status = state.blogStatus as BlogStatus;
          this.checkStatus();
        }
      },
      error: (err) => {
        console.error('Error loading vote state:', err);
      }
    });
  }

  refreshBlogStatus(): void {
    if (this.blog) {
      this.loadVoteState(this.blog.id);
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  goBack(): void {
    const fromAllBlogs = this.route.snapshot.url[0]?.path === 'blogs';

    if (fromAllBlogs) {
      this.router.navigate(['/blogs']);
    } else {
      this.router.navigate(['/author/blogs']);
    }
  }

  nextImage(): void {
    if (!this.blog || this.blog.images.length === 0) return;

    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.blog.images.length;
  }

  previousImage(): void {
    if (!this.blog || this.blog.images.length === 0) return;

    this.currentImageIndex =
      this.currentImageIndex === 0
        ? this.blog.images.length - 1
        : this.currentImageIndex - 1;
  }

  getCurrentImage(): string {
    if (this.blog && this.blog.images.length > 0) {
      return this.blog.images[this.currentImageIndex].imageUrl;
    }

    return 'https://via.placeholder.com/1200x600?text=No+Image';
  }

  onUpvote(): void {
    if (!this.blog || !this.isAuthenticated) {
      this.showError('Morate biti prijavljeni da biste glasali.');
      return;
    }

    this.blogService.vote(this.blog.id, true).subscribe({
      next: (state) => {
        this.voteState = state;

        if (this.blog) {
          this.blog.status = state.blogStatus as BlogStatus;
          this.checkStatus();
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.showError('You have to be logged in to vote.');
        } else {
          console.error('Failed to upvote', err);
          this.showError('Voting error.');
        }
      }
    });
  }

  onDownvote(): void {
    if (!this.blog || !this.isAuthenticated) {
      this.showError('You have to be logged in to vote.');
      return;
    }

    this.blogService.vote(this.blog.id, false).subscribe({
      next: (state) => {
        this.voteState = state;

        if (this.blog) {
          this.blog.status = state.blogStatus as BlogStatus;
          this.checkStatus();
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.showError('You have to be logged in to vote.');
        } else {
          console.error('Failed to downvote', err);
          this.showError('Voting error.');
        }
      }
    });
  }

  isUpvoteActive(): boolean {
    return this.voteState?.isUpvote === true;
  }

  isDownvoteActive(): boolean {
    return this.voteState?.isUpvote === false;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
