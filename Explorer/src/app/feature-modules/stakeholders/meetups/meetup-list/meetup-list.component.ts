import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MeetupService } from '../meetup.service';
import { Meetup } from '../../model/meetup.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { MeetupFormComponent } from '../meetup-form/meetup-form.component';

@Component({
  selector: 'xp-meetup-list',
  templateUrl: './meetup-list.component.html',
  styleUrls: ['./meetup-list.component.css']
})
export class MeetupListComponent implements OnInit {
  meetups: Meetup[] = [];
  isLoading: boolean = false;
  currentUserId: number = 0;

  constructor(
    private meetupService: MeetupService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.user$.value.id;
    this.loadMeetups();
  }

  loadMeetups(): void {
    this.isLoading = true;
    this.meetupService.getAllMeetups().subscribe({
      next: (result) => {
        this.meetups = result || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading meetups:', error);
        this.meetups = [];
        this.isLoading = false;
      }
    });
  }

  isCreator(meetup: Meetup): boolean {
    return meetup.creatorId === this.currentUserId;
  }

  viewDetails(id: number): void {
    this.router.navigate(['/meetups', id]);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MeetupFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMeetups();
      }
    });
  }

  openEditDialog(meetup: Meetup): void {
    const dialogRef = this.dialog.open(MeetupFormComponent, {
      width: '600px',
      data: { mode: 'edit', meetup: meetup }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMeetups();
      }
    });
  }

  deleteMeetup(meetup: Meetup): void {
    if (!this.isCreator(meetup)) {
      alert('You can only delete your own meetups.');
      return;
    }

    if (confirm('Are you sure you want to delete this meetup?')) {
      this.meetupService.deleteMeetup(meetup.id).subscribe({
        next: () => {
          this.loadMeetups();
        },
        error: (error) => {
          console.error('Error deleting meetup:', error);
          alert('Error deleting meetup');
        }
      });
    }
  }
}
