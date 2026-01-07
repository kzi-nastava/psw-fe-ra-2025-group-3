import { Component, OnInit } from '@angular/core';
import { TourService } from '../../tour-authoring/tour.service';
import { HighlightedTour } from '../../tour-authoring/model/highlighted-tour.model';
import { TourDifficulty } from '../../tour-authoring/model/tour.model';

@Component({
  selector: 'app-featured-tours',
  templateUrl: './featured-tours.component.html',
  styleUrls: ['./featured-tours.component.css']
})
export class FeaturedToursComponent implements OnInit {
  highlightedTours: HighlightedTour[] = [];
  isLoading: boolean = true;
  selectedTour: HighlightedTour | null = null;
  showPreview: boolean = false;

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.loadHighlightedTours();
  }

  loadHighlightedTours(): void {
    this.isLoading = true;
    this.tourService.getHighlightedTours().subscribe({
      next: (tours) => {
        this.highlightedTours = tours;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading highlighted tours:', error);
        this.isLoading = false;
      }
    });
  }

  openTourPreview(tour: HighlightedTour): void {
    this.selectedTour = tour;
    this.showPreview = true;
  }

  closePreview(): void {
    this.showPreview = false;
    this.selectedTour = null;
  }

  getDifficultyLabel(difficulty: TourDifficulty): string {
    switch (difficulty) {
      case TourDifficulty.Easy:
        return 'Easy';
      case TourDifficulty.Medium:
        return 'Medium';
      case TourDifficulty.Hard:
        return 'Hard';
      default:
        return 'Unknown';
    }
  }

  getDifficultyClass(difficulty: TourDifficulty): string {
    switch (difficulty) {
      case TourDifficulty.Easy:
        return 'difficulty-easy';
      case TourDifficulty.Medium:
        return 'difficulty-medium';
      case TourDifficulty.Hard:
        return 'difficulty-hard';
      default:
        return '';
    }
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}min`;
    }
  }
}
