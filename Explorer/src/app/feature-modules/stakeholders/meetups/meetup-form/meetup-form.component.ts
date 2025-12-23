import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MeetupService } from '../meetup.service';
import { Meetup, MeetupCreateDto, MeetupUpdateDto } from '../../model/meetup.model';
import { MapService } from 'src/app/shared/map/map.service';

@Component({
  selector: 'xp-meetup-form',
  templateUrl: './meetup-form.component.html',
  styleUrls: ['./meetup-form.component.css']
})
export class MeetupFormComponent implements OnInit {
  meetupForm: FormGroup;
  isEditMode: boolean = false;
  meetupId?: number;

  initialPoint?: { lat: number, lng: number };

  constructor(
    private fb: FormBuilder,
    private meetupService: MeetupService,
    private mapService: MapService,
    public dialogRef: MatDialogRef<MeetupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', meetup?: Meetup }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.meetupForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.meetup) {
      this.meetupId = this.data.meetup.id;
      this.initialPoint = { lat: this.data.meetup.latitude, lng: this.data.meetup.longitude };
      this.meetupForm.patchValue({
        title: this.data.meetup.title,
        description: this.data.meetup.description,
        dateTime: this.data.meetup.dateTime,
        address: this.data.meetup.address,
        latitude: this.data.meetup.latitude,
        longitude: this.data.meetup.longitude
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dateTime: ['', Validators.required],
      address: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]]
    });
  }

  onPointSelected(pos: { lat: number; lng: number }): void {
    this.meetupForm.patchValue({
      latitude: pos.lat,
      longitude: pos.lng
    });

    this.mapService.reverseSearch(pos.lat, pos.lng).subscribe((res) => {
      const addr = res.address;    
      const street = addr.road || '';
      const number = addr.house_number || '';
      const city = addr.city || addr.town || addr.village || '';

      let formattedAddress = '';
      if (street) formattedAddress += street;
      if (number) formattedAddress += ' ' + number;
      if (city) formattedAddress += (formattedAddress ? ', ' : '') + city;

      this.meetupForm.patchValue({ address: formattedAddress.trim() });
    });
  }

  onAddressSearch(): void {
    const address = this.meetupForm.get('address')?.value;
    if (address) {
      this.mapService.search(address).subscribe({
        next: (result) => {
          if (result && result.length > 0) {
            const lat = parseFloat(result[0].lat);
            const lon = parseFloat(result[0].lon);
            
            this.initialPoint = { lat, lng: lon };
            this.meetupForm.patchValue({
              latitude: lat,
              longitude: lon
            });
          }
        }
      });
    }
  }


  onSubmit(): void {
    if (this.meetupForm.invalid) {
      this.meetupForm.markAllAsTouched();
      return;
    }

    const formValue = this.meetupForm.value;
    
    if (this.isEditMode && this.meetupId) {
      const updateDto: MeetupUpdateDto = {
        title: formValue.title,
        description: formValue.description,
        dateTime: new Date(formValue.dateTime),
        address: formValue.address,
        latitude: formValue.latitude,
        longitude: formValue.longitude
      };

      this.meetupService.updateMeetup(this.meetupId, updateDto).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating meetup:', error);
          alert('Error updating meetup: ' + (error.error?.message || 'Unknown error'));
        }
      });
    } else {
      const createDto: MeetupCreateDto = {
        title: formValue.title,
        description: formValue.description,
        dateTime: new Date(formValue.dateTime),
        address: formValue.address,
        latitude: formValue.latitude,
        longitude: formValue.longitude
      };

      this.meetupService.createMeetup(createDto).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
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
