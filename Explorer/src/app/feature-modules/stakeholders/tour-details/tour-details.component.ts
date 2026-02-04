import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TourService } from 'src/app/feature-modules/tour-authoring/tour.service';
import { TourDetails } from '../model/tour-details.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

import { Router } from '@angular/router';
import { MeetupService } from 'src/app/feature-modules/stakeholders/meetups/meetup.service';
import { Meetup } from 'src/app/feature-modules/stakeholders/model/meetup.model';
import { WishlistService } from '../wishlist.service';
import { ShoppingCartService } from '../shopping-cart.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'xp-tour-details',
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.css']
})
export class TourDetailsComponent implements OnInit {

  tourId!: number;
  details!: TourDetails;
  isPurchased = false;
  isLoading = true;
  meetups: Meetup[] = [];
  isInWishlist = false;
  isLoadingWishlist = false;
  currentImageIndex = 0;
  isFullscreenOpen = false;
  isInCart = false;

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private meetupService: MeetupService,
    private router: Router,
    private wishlistService: WishlistService,
    private shoppingCartService: ShoppingCartService

  ) {}

  ngOnInit(): void {
    this.tourId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetails();
    this.loadMeetups();

    // Wait for user to be loaded before checking wishlist
    this.authService.user$.pipe(
      filter(user => user && user.id !== 0),
      take(1)
    ).subscribe(() => {
      this.checkWishlistStatus();
    });

    // Also check immediately in case user is already loaded
    const user = this.authService.user$.getValue();
    if (user && user.id && user.id !== 0) {
      this.checkWishlistStatus();
    }
    this.loadCart();
    this.shoppingCartService.cartUpdated.subscribe(() => this.loadCart());
  }
  currentUserId = this.authService.user$.getValue()?.id;


  loadDetails(): void {
    this.tourService.getTourDetails(this.tourId).subscribe({
      next: (details) => {
        this.details = details;
        this.isPurchased = !!details.keyPoints;
        this.currentImageIndex = 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error loading tour details', 'Close', {
          duration: 3000
        });
      }
    });
  }

  loadMeetups(): void {
    this.meetupService.getMeetupsByTourId(this.tourId).subscribe({
      next: (data) => {
        this.meetups = data;
      },
      error: (err) => {
        console.error('Failed to load meetups', err);
      }
    });
  }

  openMeetup(meetupId: number): void {
    this.router.navigate(['/meetups', meetupId]);
  }

  checkWishlistStatus(): void {
    const user = this.authService.user$.getValue();
    if (!user || !user.id || user.id === 0) {
      return; // Not logged in or invalid user
    }

    // Wait a bit to ensure token is loaded
    setTimeout(() => {
      this.wishlistService.isInWishlist(this.tourId).subscribe({
        next: (isInWishlist) => {
          this.isInWishlist = isInWishlist;
        },
        error: () => {
          // Silently fail if not authenticated or other error
          this.isInWishlist = false;
        }
      });
    }, 100);
  }

  toggleWishlist(): void {
    const user = this.authService.user$.getValue();
    if (!user || !user.id || user.id === 0) {
      this.snackBar.open('Please log in to add tours to wishlist', 'Close', {
        duration: 3000
      });
      return;
    }

    if (this.isPurchased) {
      this.snackBar.open('Purchased tours cannot be added to wishlist', 'Close', {
        duration: 3000
      });
      return;
    }

    this.isLoadingWishlist = true;

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.tourId).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.isLoadingWishlist = false;
          this.snackBar.open('Removed from wishlist', 'Close', {
            duration: 2000
          });
        },
        error: () => {
          this.isLoadingWishlist = false;
          this.snackBar.open('Error removing from wishlist', 'Close', {
            duration: 3000
          });
        }
      });
    } else {
      this.wishlistService.addToWishlist(this.tourId).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.isLoadingWishlist = false;
          this.snackBar.open('Added to wishlist', 'Close', {
            duration: 2000
          });
        },
        error: (error) => {
          this.isLoadingWishlist = false;
          const message = error.error?.message || 'Error adding to wishlist';
          this.snackBar.open(message, 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  nextImage(): void {
    if (!this.details?.images?.length) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.details.images.length;
  }

  prevImage(): void {
    if (!this.details?.images?.length) return;
    this.currentImageIndex = this.currentImageIndex === 0
      ? this.details.images.length - 1
      : this.currentImageIndex - 1;
  }

  goToImage(index: number): void {
    if (index >= 0 && index < (this.details?.images?.length ?? 0)) {
      this.currentImageIndex = index;
    }
  }

  loadCart(): void {
    this.shoppingCartService.getMyCart().subscribe({
      next: (cart) => {
        this.isInCart = cart.items?.some(item => item.tourId === this.tourId) ?? false;
      },
      error: () => {}
    });
  }

  addToCart(): void {
    if (this.isPurchased || this.isInCart || !this.tourId) return;

    this.shoppingCartService.addToCart(this.tourId).subscribe({
      next: () => {
        this.snackBar.open('Tour added to cart', 'Close', { duration: 2000 });
        this.loadCart();
      },
      error: () => {
        this.snackBar.open('This tour is already in your cart', 'Close', { duration: 3000 });
        this.loadCart();
      }
    });
  }

  openFullscreen(): void {
    if (this.details?.images?.length) {
      this.isFullscreenOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeFullscreen(): void {
    this.isFullscreenOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isFullscreenOpen) {
      if (event.key === 'Escape') {
        this.closeFullscreen();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.prevImage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.nextImage();
      }
    }
  }
}
