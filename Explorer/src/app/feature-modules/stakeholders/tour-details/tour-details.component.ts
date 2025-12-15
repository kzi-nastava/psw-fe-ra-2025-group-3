import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TourService } from 'src/app/feature-modules/tour-authoring/tour.service';
import { TourDetails } from '../model/tour-details.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

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

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private snackBar: MatSnackBar,
    private authService: AuthService

  ) {}

  ngOnInit(): void {
    this.tourId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetails();
  }
  currentUserId = this.authService.user$.getValue()?.id;


  loadDetails(): void {
    this.tourService.getTourDetails(this.tourId).subscribe({
      next: (details) => {
        this.details = details;
        this.isPurchased = !!details.keyPoints;  // 📌 null = nije kupljena
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
}
