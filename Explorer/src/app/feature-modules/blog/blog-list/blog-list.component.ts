// src/app/feature-modules/blog/blog-list/blog-list.component.ts

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlogService } from '../blog.service';
import { Blog } from '../model/blog.model';
import { BlogFormComponent } from '../blog-form/blog-form.component';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  isLoading: boolean = false;

  constructor(
    private blogService: BlogService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.isLoading = true;
    this.blogService.getMyBlogs().subscribe({
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

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(BlogFormComponent, {
      width: '700px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBlogs();
      }
    });
  }

  openEditDialog(blog: Blog): void {
    const dialogRef = this.dialog.open(BlogFormComponent, {
      width: '700px',
      data: { mode: 'edit', blog: blog }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBlogs();
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  truncateMarkdown(text: string, maxLength: number = 120): string {
  if (!text) return '';
  
  // Ukloni Markdown sintaksu PRE truncate-a da bi dobio tačnu dužinu
  const plainText = text
    .replace(/#+\s/g, '')           // Ukloni # za headinge
    .replace(/\*\*/g, '')            // Ukloni ** za bold
    .replace(/\*/g, '')              // Ukloni * za italic
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Ukloni linkove
  
  if (plainText.length <= maxLength) {
    return text; // Vrati original Markdown
  }
  
  // Truncate na reči
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

  truncateText(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}