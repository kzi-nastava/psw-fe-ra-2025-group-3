import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private route: ActivatedRoute, private service: StakeholderService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(authorId: number) {
    this.isLoading = true;
    this.service.getAuthorProfileStats(authorId).subscribe({
      next: (res) => { this.stats = res; this.isLoading = false; },
      error: (err) => { console.error(err); this.stats = null; this.isLoading = false; }
    });
  }
}
