import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';        
import { MatSnackBarModule } from '@angular/material/snack-bar'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TourProblemListComponent } from './tour-problem-list/tour-problem-list.component';
import { TourProblemFormComponent } from './tour-problem-form/tour-problem-form.component';
import { TourProblemDetailsComponent } from './tour-problem-details/tour-problem-details.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';      
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActiveTourComponent } from './active-tour/active-tour.component'; 
import { SharedModule } from 'src/app/shared/shared.module';
import { TourReviewFormComponent } from './tour-review-form/tour-review-form.component';
import { TourReviewsListComponent } from './tour-reviews-list/tour-reviews-list.component';
import { TourReviewsComponent } from './tour-reviews/tour-reviews.component';



@NgModule({
  declarations: [
    TourProblemListComponent,
    TourProblemFormComponent,
    TourProblemDetailsComponent,
    ActiveTourComponent,
    TourReviewFormComponent,
    TourReviewsListComponent,
    TourReviewsComponent
    
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatChipsModule,
    MatTabsModule,     
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,       
    MatSnackBarModule,     
    SharedModule
  ],
  exports: [
    TourProblemListComponent,
    ActiveTourComponent,
    TourReviewsComponent 
  ]
})
export class TourExecutionModule { }