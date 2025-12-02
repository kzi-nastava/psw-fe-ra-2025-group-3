import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TourProblemListComponent } from './tour-problem-list/tour-problem-list.component';
import { TourProblemFormComponent } from './tour-problem-form/tour-problem-form.component';
import { TourProblemDetailsComponent } from './tour-problem-details/tour-problem-details.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';      
import { MatCheckboxModule } from '@angular/material/checkbox'; 



@NgModule({
  declarations: [
    TourProblemListComponent,
    TourProblemFormComponent,
    TourProblemDetailsComponent
    
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
    MatProgressSpinnerModule
  ],
  exports: [
    TourProblemListComponent
  ]
})
export class TourExecutionModule { }