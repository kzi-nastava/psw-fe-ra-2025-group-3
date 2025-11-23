import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRatingListComponent } from './app-rating-list/app-rating-list.component';
import { MyAppRatingComponent } from './my-app-rating/my-app-rating.component';
import { ClubsModule } from './clubs/clubs.module';
import { MeetupListComponent } from './meetups/meetup-list/meetup-list.component';
import { MeetupFormComponent } from './meetups/meetup-form/meetup-form.component';
import { MeetupDetailsComponent } from './meetups/meetup-details/meetup-details.component';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  declarations: [
    ProfileComponent,
    AppRatingListComponent,
    MyAppRatingComponent,
    MeetupListComponent,
    MeetupFormComponent,
    MeetupDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,   
    MatIconModule,  
    MatButtonModule,
    MatDialogModule,
    ClubsModule,
    MarkdownModule.forChild()
  ],
  exports: [
    ProfileComponent
  ]
})
export class StakeholdersModule { }