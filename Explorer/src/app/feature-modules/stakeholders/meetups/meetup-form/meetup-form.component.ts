import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MeetupService } from '../meetup.service';
import { Meetup, MeetupCreateDto, MeetupUpdateDto } from '../../model/meetup.model';
import { TourService } from 'src/app/feature-modules/tour-authoring/tour.service';
import { Tour } from 'src/app/feature-modules/tour-authoring/model/tour.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-meetup-form',
  templateUrl: './meetup-form.component.html',
  styleUrls: ['./meetup-form.component.css']
})
export class MeetupFormComponent implements OnInit {
  meetupForm: FormGroup;
  isEditMode: boolean = false;
  meetupId?: number;
  availableTours: Tour[] = []; 

  constructor(
    private fb: FormBuilder,
    private meetupService: MeetupService,
    private tourService: TourService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<MeetupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', meetup?: Meetup }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.meetupForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadTours();

    if (this.isEditMode && this.data.meetup) {
      this.meetupId = this.data.meetup.id;
      this.meetupForm.patchValue({
        title: this.data.meetup.title,
        description: this.data.meetup.description,
        dateTime: this.data.meetup.dateTime,
        latitude: this.data.meetup.latitude,
        longitude: this.data.meetup.longitude,
        tourId: this.data.meetup.tourId 
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dateTime: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      tourId: [null]
    });
  }

  loadTours(): void {
    const userRole = this.authService.user$.getValue().role.toLowerCase();
    
    if (userRole === 'author') {
        this.tourService.getMyTours().subscribe({
            next: (result: Tour[]) => {
                this.availableTours = result;
            },
            error: (err: any) => console.error('Failed to load tours', err)
        });
    } 
  }

  onSubmit(): void {
    if (this.meetupForm.invalid) {
      this.meetupForm.markAllAsTouched();
      return;
    }

    const formValue = this.meetupForm.value;
    
    const meetupData = {
        title: formValue.title,
        description: formValue.description,
        dateTime: new Date(formValue.dateTime),
        latitude: formValue.latitude,
        longitude: formValue.longitude,
        tourId: formValue.tourId 
    };

    if (this.isEditMode && this.meetupId) {
      const updateDto: MeetupUpdateDto = meetupData;

      this.meetupService.updateMeetup(this.meetupId, updateDto).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: any) => { 
          console.error('Error updating meetup:', error);
          alert('Error updating meetup: ' + (error.error?.message || 'Unknown error'));
        }
      });
    } else {
      const createDto: MeetupCreateDto = meetupData;

      this.meetupService.createMeetup(createDto).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: any) => { 
          console.error('Error creating meetup:', error);
          alert('Error creating meetup: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}