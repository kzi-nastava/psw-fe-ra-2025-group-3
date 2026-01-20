import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HighlightedTour } from '../../tour-authoring/model/highlighted-tour.model';
import { TourDifficulty } from '../../tour-authoring/model/tour.model';

@Component({
  selector: 'app-tour-preview',
  templateUrl: './tour-preview.component.html',
  styleUrls: ['./tour-preview.component.css']
})
export class TourPreviewComponent {
  @Input() tour!: HighlightedTour;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
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

  getStarsFill(rating: number): number[] {
    const safe = Math.max(0, Math.min(5, rating || 0));

    return Array.from({ length: 5 }, (_, i) => {
      const value = safe - i;         
      const clamped = Math.max(0, Math.min(1, value));
      return Math.round(clamped * 100); 
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
