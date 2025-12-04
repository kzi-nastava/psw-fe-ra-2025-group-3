// src/app/feature-modules/blog/blog-detail/blog-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlogService } from '../blog.service';
import { Blog } from '../model/blog.model';
import { BlogVoteStateDto } from '../model/blog.model';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const blogId = this.route.snapshot.paramMap.get('id');
    if (blogId) {
      const id = Number(blogId);
      this.loadBlog(id);
      this.loadVoteState(id);
    } else {
      this.showError('Invalid blog ID');
      this.goBack();
    }
  }

  loadBlog(id: number): void {
    this.isLoading = true;
    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        this.blog = blog;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.showError('Failed to load blog');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  private loadVoteState(id: number): void {
    if (!this.isAuthenticated) {
      return;
    }

    this.blogService.getVoteState(id).subscribe({
      next: (state) => {
        this.voteState = state;
      },
      error: (err) => {
        console.error('Error loading vote state:', err);
      },
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/author/blogs']);
  }

  nextImage(): void {
    if (this.blog && this.blog.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.blog.images.length;
    }
  }

  previousImage(): void {
    if (this.blog && this.blog.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.blog.images.length - 1 
        : this.currentImageIndex - 1;
    }
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
      },
      error: (err) => {
        if (err.status === 401) {
          this.showError('Morate biti prijavljeni da biste glasali.');
        } else {
          console.error('Failed to upvote', err);
          this.showError('Greška pri glasanju.');
        }
      },
    });
  }

  onDownvote(): void {
    if (!this.blog || !this.isAuthenticated) {
      this.showError('Morate biti prijavljeni da biste glasali.');
      return;
    }

    this.blogService.vote(this.blog.id, false).subscribe({
      next: (state) => {
        this.voteState = state;
      },
      error: (err) => {
        if (err.status === 401) {
          this.showError('Morate biti prijavljeni da biste glasali.');
        } else {
          console.error('Failed to downvote', err);
          this.showError('Greška pri glasanju.');
        }
      },
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