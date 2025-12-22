import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MeetupService } from '../meetup.service';
import { Meetup } from '../../model/meetup.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-meetup-details',
  templateUrl: './meetup-details.component.html',
  styleUrls: ['./meetup-details.component.css']
})
export class MeetupDetailsComponent implements OnInit {
  meetup: Meetup | null = null;
  isLoading: boolean = true;
  userRole: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetupService: MeetupService,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.user$.getValue().role.toLowerCase();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadMeetup(id);
    } else {
      this.router.navigate(['/meetups']);
    }
  }

  loadMeetup(id: number): void {
    this.isLoading = true;
    this.meetupService.getMeetupById(id).subscribe({
      next: (meetup) => {
        this.meetup = meetup;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading meetup:', error);
        this.isLoading = false;
        alert('Meetup not found');
        this.router.navigate(['/meetups']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/meetups']);
  }

  goToRelatedTour(): void {
    if (this.meetup && this.meetup.tourId) {
      
      if (this.userRole === 'author') {
         this.router.navigate(['/author/tours']); 
      } else {
         this.router.navigate(['/tourist/tours', this.meetup.tourId, 'details']);
      }
    }
  }
}