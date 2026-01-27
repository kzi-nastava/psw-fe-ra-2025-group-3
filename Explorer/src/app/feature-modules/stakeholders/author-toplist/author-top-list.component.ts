import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StakeholderService } from '../stakeholder.service';
import { AuthorTopListItemDto } from '../model/author-top-list-item.model';

@Component({
  selector: 'xp-author-top-list',
  templateUrl: './author-top-list.component.html',
  styleUrls: ['./author-top-list.component.css']
})
export class AuthorTopListComponent implements OnInit {
  items: AuthorTopListItemDto[] = [];
  isLoading = false;

  sort: 'rating' | 'purchases' | 'reviews' | 'tours' = 'rating';

  constructor(
    private service: StakeholderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;

    this.service.getTopAuthors(this.sort, 20).subscribe({
      next: (res) => {
        this.items = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load top authors:', err);
        this.items = [];
        this.isLoading = false;
      }
    });
  }

  // (opcijalno) ako budeš koristila (change) sa vrednošću
  onSortChange(value: 'rating' | 'purchases' | 'reviews' | 'tours') {
    this.sort = value;
    this.load();
  }

  openAuthor(authorId: number) {
    // ✅ ruta koju si dodala u AppRoutingModule:
    // { path: 'tourist/authors/:id', component: AuthorProfileComponent ... }
    this.router.navigate(['/tourist/authors', authorId]);
  }

  trackByAuthorId(index: number, item: AuthorTopListItemDto) {
    return item.authorId;
  }
}
