import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TourExecutionService } from '../tour-execution.service';
import { TourService } from '../../tour-authoring/tour.service';
import { TourExecution } from '../model/tour-execution.model';
import { Tour } from '../../tour-authoring/model/tour.model';

@Component({
  selector: 'xp-active-tour',
  templateUrl: './active-tour.component.html',
  styleUrls: ['./active-tour.component.css']
})
export class ActiveTourComponent implements OnInit {
  isLoading = true;
  execution: TourExecution | null = null;
  tour: Tour | null = null;

  constructor(
    private tourExecutionService: TourExecutionService,
    private tourService: TourService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadActiveExecution();
  }

  loadActiveExecution(): void {
    this.tourExecutionService.getActiveTourExecution().subscribe({
      next: (execution) => {
        if (!execution) {
          console.log('[Active Tour] No active execution, redirecting');
          this.router.navigate(['/tourist/tours']);
          return;
        }

        console.log('[Active Tour] Loaded execution:', execution);
        this.execution = execution;
        this.loadTourDetails(execution.tourId);
      },
      error: (err) => {
        console.error('[Active Tour] Error:', err);
        this.isLoading = false;
        this.router.navigate(['/tourist/tours']);
      }
    });
  }

  loadTourDetails(tourId: number): void {
    // Koristi Published Tours endpoint - Tourist ima pristup
    this.tourService.getPublishedToursForTourist().subscribe({
      next: (tours) => {
        this.tour = tours.find(t => t.id === tourId) || null;
        
        if (!this.tour) {
          console.error('[Active Tour] Tour not found');
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[Active Tour] Error loading tours:', err);
        this.isLoading = false;
      }
    });
  }

  getFormattedStartTime(): string {
    if (!this.execution) return '';
    return new Date(this.execution.startTime).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }
}