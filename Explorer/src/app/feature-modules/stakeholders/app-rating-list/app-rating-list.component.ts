import { Component, OnInit } from '@angular/core';
import { AppRatingService } from '../app-rating.service';
import { AppRatingResponse } from '../model/app-rating.model';

@Component({
  selector: 'xp-app-rating-list',
  templateUrl: './app-rating-list.component.html',
  styleUrls: ['./app-rating-list.component.css']
})
export class AppRatingListComponent implements OnInit {

  ratings: AppRatingResponse[] = [];

  constructor(private appRatingService: AppRatingService) { }

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(): void {
    this.appRatingService.getAllRatings().subscribe({
      next: (result) => {
        this.ratings = result;
      },
      error: (err) => {
        console.error('Error while loading ratings', err);
        this.ratings = [];
      }
    });
  }
}

