import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { ProfileFormComponent } from './profile-form/profile-form.component';
import { ProfileListComponent } from './profile-list/profile-list.component';
import { TouristToursComponent } from './tourist-tours/tourist-tours.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { MyPurchasedToursComponent } from './my-purchased-tours/my-purchased-tours.component';  //tour execution
import { RecommendedToursComponent } from './preferences/recommended-tours/recommended-tours.component'; //tour recommendstions 
// Angular Material moduli
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { PreferenceOverviewComponent } from './preferences/preference-overview/preference-overview.component';
import { PreferenceFormComponent } from './preferences/preference-form/preference-form.component';
import { TouristEquipmentComponent } from './tourist-equipment/tourist-equipment.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { PurchaseSuccessComponent } from './purchase/purchase-success.component'; 
import { TourExecutionModule } from '../tour-execution/tour-execution.module';
import { TourDetails } from './model/tour-details.model';
import { TourDetailsComponent } from './tour-details/tour-details.component';
import { TouristEncountersComponent } from './tourist-encounters/tourist-encounters.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatListModule } from '@angular/material/list'; 
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    ProfileComponent,
    AppRatingListComponent,
    MyAppRatingComponent,
    MeetupListComponent,
    MeetupFormComponent,
    MeetupDetailsComponent,
    ProfileFormComponent,
    ProfileListComponent,
    PreferenceOverviewComponent,
    PreferenceFormComponent,
    ShoppingCartComponent,
    TouristToursComponent,
    TouristEquipmentComponent,
    PurchaseSuccessComponent,
    TourDetailsComponent,
    MyPurchasedToursComponent, // t execution
    TouristEncountersComponent,
    RecommendedToursComponent // tour recommendations
    
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,   
    MatIconModule,  
    MatButtonModule,
    MatDialogModule,
    ClubsModule,
    MarkdownModule.forChild(),
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    SharedModule,
    MaterialModule,
    TourExecutionModule,
    RouterModule,
    SharedModule,
    SharedModule,
    MatListModule,
    MatTooltipModule
  ],
  exports: [
    ProfileComponent,
    ProfileFormComponent,
    ProfileListComponent,
    TouristEquipmentComponent,
    PurchaseSuccessComponent,
    TourDetailsComponent
  ]
})
export class StakeholdersModule { }