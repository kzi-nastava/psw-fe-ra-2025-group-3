import { Component, OnInit } from '@angular/core';
import { MeetupService } from '../meetup.service';
import { Meetup } from '../../model/meetup.model';

@Component({
  selector: 'xp-meetup-list',
  templateUrl: './meetup-list.component.html',
  styleUrls: ['./meetup-list.component.css']
})
export class MeetupListComponent implements OnInit {
  meetups: Meetup[] = [];
  isLoading: boolean = false;

  constructor(
    private meetupService: MeetupService
  ) {}

  ngOnInit(): void {
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
}
