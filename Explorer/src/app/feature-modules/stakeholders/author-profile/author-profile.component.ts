import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StakeholderService } from '../stakeholder.service';
import { AuthorProfileStatsDto } from '../model/author-profile-stats.model';

@Component({
  selector: 'xp-author-profile',
  templateUrl: './author-profile.component.html',
  styleUrls: ['./author-profile.component.css']
})
export class AuthorProfileComponent implements OnInit {

  stats: AuthorProfileStatsDto | null = null;
  isLoading = false;

  // 👉 index trenutno prikazane recenzije
  reviewIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private service: StakeholderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(authorId: number): void {
    this.isLoading = true;

    this.service.getAuthorProfileStats(authorId).subscribe({
      next: (res) => {
        this.stats = res;
        this.reviewIndex = 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.stats = null;
        this.isLoading = false;
      }
    });
  }

  // ◀️ prethodna recenzija
  prevReview(): void {
    if (!this.stats) return;
    this.reviewIndex = Math.max(0, this.reviewIndex - 1);
  }

  // ▶️ sledeća recenzija
  nextReview(): void {
    if (!this.stats) return;
    this.reviewIndex = Math.min(
      this.stats.recentReviews.length - 1,
      this.reviewIndex + 1
    );
  }

  // 👉 opciono ako želiš navigaciju iz TS-a
  goToToursShop(): void {
    this.router.navigate(['/tourist/tours']);
  }
}
