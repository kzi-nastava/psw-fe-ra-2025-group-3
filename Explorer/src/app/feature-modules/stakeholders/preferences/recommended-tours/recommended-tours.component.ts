// src/app/feature-modules/stakeholders/preferences/recommended-tours/recommended-tours.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '../../preference.service';
import { RecommendedTour } from '../../model/recommended-tour.model';

@Component({
  selector: 'xp-recommended-tours',
  templateUrl: './recommended-tours.component.html',
  styleUrls: ['./recommended-tours.component.css']
})
export class RecommendedToursComponent implements OnInit {
  recommendedTours: RecommendedTour[] = [];
  isLoading = true;
  error: string | null = null;

  difficultyLabels: { [key: number]: string } = {
    0: 'Easy',
    1: 'Medium',
    2: 'Hard'
  };

  difficultyIcons: { [key: number]: string } = {
    0: 'sentiment_satisfied',
    1: 'sentiment_neutral',
    2: 'fitness_center'
  };

  constructor(
    private preferenceService: PreferenceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecommendedTours();
  }

  loadRecommendedTours(): void {
    this.isLoading = true;
    this.error = null;

    this.preferenceService.getRecommendedTours().subscribe({
      next: (tours) => {
        this.recommendedTours = tours;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading recommended tours:', err);
        this.error = err.error?.message || 'Failed to load recommended tours. Please set your preferences first.';
        this.isLoading = false;
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-primary-500)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-neutral-500)';
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  }

  viewTourDetails(tourId: number): void {
    this.router.navigate(['/tourist/tours', tourId, 'details']);
  }

  goToPreferences(): void {
    this.router.navigate(['/tourist/preferences']);
  }
}