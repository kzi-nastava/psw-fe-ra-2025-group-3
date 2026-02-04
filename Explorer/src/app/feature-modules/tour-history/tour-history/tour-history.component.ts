import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TourHistoryService } from '../tour-history.service';
import { TourHistoryResponse, CompletedTour, TourStatistics, TourComparison } from '../tour-history.model';
import { TourService } from '../../tour-authoring/tour.service';

@Component({
  selector: 'xp-tour-history',
  templateUrl: './tour-history.component.html',
  styleUrls: ['./tour-history.component.css']
})
export class TourHistoryComponent implements OnInit, OnDestroy {

  loading = true;
  error = '';
  completedTours: CompletedTour[] = [];
  statistics?: TourStatistics;
  comparison?: TourComparison;
  showList = false;

  constructor(
    private tourHistoryService: TourHistoryService,
    private tourService: TourService,
    private router: Router
  ) {}

  // Pretvori minute u sate i minute (npr. 47h 12min) ili dane
  getTotalTime(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes < 1) return '0 min';
    const rounded = Math.round(totalMinutes);
    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;
    
    // If more than 24 hours, convert to days
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      let result = `${days}d`;
      if (remainingHours > 0) {
        result += ` ${remainingHours}h`;
      }
      if (minutes > 0) {
        result += ` ${minutes}min`;
      }
      return result;
    }
    
    if (hours > 0) {
      if (minutes > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${hours}h`;
    }
    return `${minutes} min`;
  }

  // Badge medal type by number of completed tours
  getBadgeType(): 'bronze' | 'silver' | 'gold' | null {
    const count = this.completedToursCount;
    if (count >= 20) return 'gold';
    if (count >= 10) return 'silver';
    if (count >= 5) return 'bronze';
    return null;
  }
  ngOnInit(): void {
    this.loadTourHistory();
    window.addEventListener('storage', this.handleStorageEvent);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.handleStorageEvent);
  }

  loadTourHistory(): void {
    this.loading = true;
    this.tourHistoryService.getTourHistory().subscribe({
      next: (data: TourHistoryResponse) => {
        this.statistics = data.statistics;
        this.comparison = data.comparison;
        
        if (data.completedTours.length === 0) {
          this.completedTours = [];
          this.loading = false;
          return;
        }
        
        // Use searchTours to get all published tours with images
        this.tourService.searchTours({}).subscribe({
          next: (allTours) => {
            console.log('All tours from searchTours:', allTours);
            
            // Create a map of tourId -> Tour for quick lookup
            const tourMap = new Map();
            allTours.forEach(tour => {
              if (tour && tour.id) {
                tourMap.set(tour.id, tour);
              }
            });
            
            // Merge tour data with completed tour data
            this.completedTours = data.completedTours.map(completedTour => {
              const tour = tourMap.get(completedTour.tourId);
              console.log('Tour ID:', completedTour.tourId, 'Found tour:', tour, 'Image:', tour?.firstKeyPoint?.imageUrl);
              return {
                ...completedTour,
                firstKeyPoint: tour?.firstKeyPoint
              };
            });
            this.loading = false;
          },
          error: () => {
            // If tour loading fails, still show the completed tours
            this.completedTours = data.completedTours;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Greška pri učitavanju podataka.';
        this.loading = false;
      }
    });
  }

  handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'tour-completed') {
      this.loadTourHistory();
    }
  }

  get completedToursCount(): number {
    return this.statistics?.totalCompletedTours ?? 0;
  }

  // Rounded percent for hero section
  get comparisonPercent(): number {
    return this.comparison ? Math.round(this.comparison.toursPercentageDifference) : 0;
  }

  navigateToMyTours(): void {
    this.router.navigate(['/tourist/my-tours']);
  }

  viewDetails(tourId: number): void {
    this.router.navigate(['/tourist/tours', tourId, 'details']);
  }
}
