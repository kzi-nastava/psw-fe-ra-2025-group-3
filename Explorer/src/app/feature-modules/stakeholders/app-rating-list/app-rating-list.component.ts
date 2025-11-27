import { Component, OnInit } from '@angular/core';
import { AppRatingService } from '../app-rating.service';
import { AppRatingResponse, PagedResult } from '../model/app-rating.model';

@Component({
  selector: 'xp-app-rating-list',
  templateUrl: './app-rating-list.component.html',
  styleUrls: ['./app-rating-list.component.css']
})
export class AppRatingListComponent implements OnInit {

  ratings: AppRatingResponse[] = [];
  page: number = 1;
  pageSize: number = 6;
  totalCount: number = 0;

  constructor(private appRatingService: AppRatingService) { }

  ngOnInit(): void {
    this.loadRatings();
  }

  get maxPage(): number {
    return this.totalCount === 0 ? 1 : Math.ceil(this.totalCount / this.pageSize);
  }

  loadRatings(): void {
    this.appRatingService.getAllRatings(this.page, this.pageSize).subscribe({
      next: (result: PagedResult<AppRatingResponse>) => {
        this.ratings = result.results;
        this.totalCount = result.totalCount; 

        if (this.page > this.maxPage) {
          this.page = this.maxPage;
          this.loadRatings();
        }
      },
      error: (err) => {
        console.error('Error while loading ratings', err);
        this.ratings = [];
        this.totalCount = 0;
      }
    });
  }

  nextPage(): void {
    if (this.page < this.maxPage) {
      this.page++;
      this.loadRatings();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadRatings();
    }
  }
}

