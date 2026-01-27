import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tour, TourStatus, TourSearchParams, TourDifficulty } from 'src/app/feature-modules/tour-authoring/model/tour.model';
import { TourService } from 'src/app/feature-modules/tour-authoring/tour.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HighlightedTour } from '../../tour-authoring/model/highlighted-tour.model';
import { ShoppingCartService } from '../shopping-cart.service';
import { Router } from '@angular/router';
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { TourExecutionCreateDto } from '../../tour-execution/model/tour-execution.model';
import { PositionSimulatorService } from 'src/app/shared/position-simulator/position-simulator.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

interface TouristTourView extends Tour {
  isPurchased?: boolean;
}

@Component({
  selector: 'xp-tourist-tours',
  templateUrl: './tourist-tours.component.html',
  styleUrls: ['./tourist-tours.component.css'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1',
        overflow: 'visible'
      })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class TouristToursComponent implements OnInit {

  tours: TouristTourView[] = [];
  isLoading = false;
  startingTourId: number | null = null;
  hasActiveTour = false;
  TourStatus = TourStatus;
  TourDifficulty = TourDifficulty;
  toursInCart: Set<number> = new Set();

  expandedTourId: number | null = null;
  currentUserId?: number;

  // Search & Filter
  searchControl = new FormControl('');
  tagSearchControl = new FormControl('');
  selectedTags: string[] = [];
  selectedDifficulties: TourDifficulty[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedMinRating: number | null = null;
  filterOnSale: boolean | null = null;
  sortByDiscount: boolean = false;
  
  availableTags: string[] = [];
  ratingOptions = [1, 2, 3, 4, 5];
  totalResults = 0;
  isFiltersExpanded = false;

  // Advanced search bar - popular tours dropdown
  showPopularToursDropdown = false;
  popularTours: HighlightedTour[] = [];
  @ViewChild('searchSection', { read: ElementRef }) searchSection?: ElementRef;

  constructor(
    private tourService: TourService,
    private shoppingCartService: ShoppingCartService,
    private snackBar: MatSnackBar,
    private positionSimulator: PositionSimulatorService,
    private tourExecutionService: TourExecutionService,
    private router: Router,
    private authService: AuthService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.checkActiveTour();
    this.loadAllTags();
    this.loadCart();
    this.loadPopularTours();
    this.searchTours();
    const user = this.authService.user$.value;
    if (user) {
      this.currentUserId = user.id;
    }

    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.showPopularToursDropdown = false; // Hide dropdown when typing
        this.searchTours();
      });

    // Subscribe to cart updates
    this.shoppingCartService.cartUpdated.subscribe(() => {
      this.loadCart();
    });
  }

  loadAllTags(): void {
    // Load all available tags from ALL tours (not filtered)
    this.tourService.searchTours({}).subscribe({
      next: (allTours: Tour[]) => {
        const allTags = new Set<string>();
        allTours.forEach(tour => {
          tour.tags?.forEach(tag => allTags.add(tag));
        });
        this.availableTags = Array.from(allTags).sort();
      },
      error: (error) => {
        console.error('Error loading tags:', error);
      }
    });
  }

  checkActiveTour(): void {
    this.tourExecutionService.getActiveTourExecution().subscribe({
      next: (execution) => {
        this.hasActiveTour = !!execution;
      },
      error: () => {
        this.hasActiveTour = false;
      }
    });
  }

  searchTours(): void {
    this.isLoading = true;

    const searchParams: TourSearchParams = {
      name: this.searchControl.value || undefined,
      tags: this.selectedTags.length > 0 ? this.selectedTags : undefined,
      difficulties: this.selectedDifficulties.length > 0 ? this.selectedDifficulties : undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      minRating: this.selectedMinRating ?? undefined,
      onSale: this.filterOnSale ?? undefined,
      sortByDiscount: this.sortByDiscount || undefined
    };

    this.tourService.searchTours(searchParams).subscribe({
      next: (tours: Tour[]) => {
        // Filter out purchased tours
        this.tours = (tours as TouristTourView[]).filter(tour => !tour.isPurchased);
        
        // Check purchase status for remaining tours
        this.tours.forEach(tour => {
          if (tour.id) {
            this.tourService.getTourDetails(tour.id).subscribe(details => {
              tour.isPurchased = !!details.keyPoints;
              // Re-filter if tour is actually purchased
              if (tour.isPurchased) {
                this.tours = this.tours.filter(t => t.id !== tour.id);
                this.totalResults = this.tours.length;
              }
            });
          }
        });
        
        this.totalResults = this.tours.length;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error searching tours:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        this.isLoading = false;
        this.showError('Error loading tours');
      }
    });
  }

  addToCart(tour: Tour): void {
    if (!tour.id) {
      this.showError('Invalid tour.');
      return;
    }

    this.shoppingCartService.addToCart(tour.id).subscribe({
      next: () => {
        this.showSuccess('Tour successfully added to your cart!');
        this.loadCart(); // Refresh cart status
      },
      error: (error) => {
        console.error('Add to cart error:', error);
        this.showError('This tour is already in your cart.');
        this.loadCart(); // Refresh cart status even on error
      }
    });
  }

  loadCart(): void {
    this.shoppingCartService.getMyCart().subscribe({
      next: (cart) => {
        this.toursInCart.clear();
        cart.items?.forEach(item => {
          if (item.tourId) {
            this.toursInCart.add(item.tourId);
          }
        });
      },
      error: () => {}
    });
  }

  isInCart(tourId: number): boolean {
    return this.toursInCart.has(tourId);
  }

  startTour(tour: Tour): void {
    if (!tour.id) {
      this.showError('Invalid tour.');
      return;
    }

    
    this.tourExecutionService.getActiveTourExecution().subscribe({
      next: (activeExecution) => {
        if (activeExecution) {
          this.showError('You already have an active tour. Please complete or abandon it first.');
          this.router.navigate(['/tour-execution/active']);
          return;
        }
        
        this.proceedWithTourStart(tour);
      },
      error: (err) => {
        console.error('[Start Tour] Error checking active execution:', err);
        this.showError('Error checking active tours.');
      }
    });
  }

  private proceedWithTourStart(tour: Tour): void {
    this.startingTourId = tour.id!;

    console.log('[Start Tour] Getting position from Position Simulator (which uses TouristMapService)...');

    this.positionSimulator.getCurrentPosition().subscribe({
      next: (position) => {
        if (position.source === 'none' || position.latitude === 0 || position.longitude === 0) {
          this.startingTourId = null;
          console.log('[Start Tour] ❌ No position available');
          this.showError('Cannot start: Location access is required. Please set your position on the Explore Map first.');
          this.router.navigate(['/tourist/map']);
          return;
        }

        console.log('[Start Tour] ✅ Position obtained:', position);

        const dto: TourExecutionCreateDto = {
          tourId: tour.id!,
          startLatitude: position.latitude,
          startLongitude: position.longitude
        };

        this.tourExecutionService.startTour(dto).subscribe({
          next: (execution) => {
            this.startingTourId = null;
            console.log('[Start Tour] ✅ Tour started:', execution);
            this.showSuccess('Tour started successfully!');
            this.hasActiveTour = true;
            this.router.navigate(['/tour-execution/active']);
          },
          error: (error) => {
            this.startingTourId = null;
            console.error('[Start Tour] ❌ Error:', error);
            const errorMsg = error?.error?.message || 'Error starting tour';
            this.showError(errorMsg);
          }
        });
      },
      error: (err) => {
        this.startingTourId = null;
        console.error('[Start Tour] ❌ Position error:', err);
        this.showError('Cannot start: Failed to get your location.');
      }
    });
  }

  getStatusLabel(status: TourStatus): string {
    switch (status) {
      case TourStatus.Published:
        return 'Published';
      case TourStatus.Archived:
        return 'Archived';
      case TourStatus.Draft:
        return 'Draft';
      default:
        return 'Unknown';
    }
  }

  isStartingTour(tourId: number): boolean {
    return this.startingTourId === tourId;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
  
  expandReviews(tour: Tour): void {
    if (this.expandedTourId === tour.id) {
      this.expandedTourId = null;  
    } else {
      this.expandedTourId = tour.id;  
    }
  }

  // Filter methods
  onTagToggle(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.searchTours();
  }

  onDifficultyToggle(difficulty: TourDifficulty): void {
    const index = this.selectedDifficulties.indexOf(difficulty);
    if (index > -1) {
      this.selectedDifficulties.splice(index, 1);
    } else {
      this.selectedDifficulties.push(difficulty);
    }
    this.searchTours();
  }

  onPriceChange(): void {
    this.searchTours();
  }

  onRatingChange(): void {
    this.searchTours();
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.selectedTags = [];
    this.selectedDifficulties = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedMinRating = null;
    this.filterOnSale = null;
    this.sortByDiscount = false;
    this.searchTours();
  }

  onSaleFilterChange(): void {
    this.searchTours();
  }

  onSortByDiscountChange(): void {
    this.searchTours();
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.searchControl.value) count++;
    if (this.selectedTags.length > 0) count++;
    if (this.selectedDifficulties.length > 0) count++;
    if (this.minPrice !== null || this.maxPrice !== null) count++;
    if (this.selectedMinRating !== null) count++;
    if (this.filterOnSale !== null) count++;
    if (this.sortByDiscount) count++;
    return count;
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  isDifficultySelected(difficulty: TourDifficulty): boolean {
    return this.selectedDifficulties.includes(difficulty);
  }

  // Advanced search bar - popular tours methods
  loadPopularTours(): void {
    this.tourService.getHighlightedTours().subscribe({
      next: (tours) => {
        this.popularTours = tours;
      },
      error: (error) => {
        console.error('Error loading popular tours:', error);
      }
    });
  }

  get filteredTags(): string[] {
    const searchTerm = this.tagSearchControl.value?.toLowerCase() || '';
    if (!searchTerm) {
      return this.availableTags;
    }
    return this.availableTags.filter(tag => 
      tag.toLowerCase().includes(searchTerm)
    );
  }

  onSearchBarFocus(): void {
    // Show dropdown only if search bar is empty
    if (!this.searchControl.value || this.searchControl.value.trim() === '') {
      this.showPopularToursDropdown = true;
    }
  }

  onPopularTourSelect(tour: HighlightedTour): void {
    this.searchControl.setValue(tour.name);
    this.showPopularToursDropdown = false;
    this.searchTours();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.searchSection) {
      const clickedInside = this.searchSection.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.showPopularToursDropdown = false;
      }
    }
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/default-tour.jpg';
    }
  }
}