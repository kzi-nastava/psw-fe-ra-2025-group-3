import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppRatingListComponent } from './app-rating-list/app-rating-list.component';
import { MyAppRatingComponent } from './my-app-rating/my-app-rating.component';
import { ClubsModule } from './clubs/clubs.module';
import { MeetupListComponent } from './meetups/meetup-list/meetup-list.component';

@NgModule({
  declarations: [
    ProfileComponent,
    AppRatingListComponent,
    MyAppRatingComponent,
    MeetupListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ClubsModule
  ],
  exports: [
    ProfileComponent
  ]
})
export class StakeholdersModule { }