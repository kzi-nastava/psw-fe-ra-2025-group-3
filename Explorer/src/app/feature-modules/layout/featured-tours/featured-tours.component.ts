import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { TourService } from '../../tour-authoring/tour.service';
import { HighlightedTour } from '../../tour-authoring/model/highlighted-tour.model';
import { TourDifficulty } from '../../tour-authoring/model/tour.model';

@Component({
  selector: 'app-featured-tours',
  templateUrl: './featured-tours.component.html',
  styleUrls: ['./featured-tours.component.css']
})
export class FeaturedToursComponent implements OnInit, AfterViewInit, OnDestroy {
  highlightedTours: HighlightedTour[] = [];
  isLoading: boolean = true;
  selectedTour: HighlightedTour | null = null;
  showPreview: boolean = false;
  private observer: IntersectionObserver | null = null;

  constructor(
    private tourService: TourService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadHighlightedTours();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initScrollReveal(), 300);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private initScrollReveal(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ft-revealed');
          this.observer?.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    this.el.nativeElement.querySelectorAll('.ft-reveal').forEach((el: Element) => {
      this.observer?.observe(el);
    });
  }

  loadHighlightedTours(): void {
    this.isLoading = true;
    this.tourService.getHighlightedTours().subscribe({
      next: (tours) => {
        this.highlightedTours = tours.slice(0, 4);
        this.isLoading = false;
        // Re-observe grid after it renders
        setTimeout(() => this.initScrollReveal(), 100);
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
      return `${mins}min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}min`;
    }
  }
}
