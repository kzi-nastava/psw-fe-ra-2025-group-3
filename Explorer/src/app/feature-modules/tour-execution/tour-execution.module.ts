import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TourProblemListComponent } from './tour-problem-list/tour-problem-list.component';
import { TourProblemFormComponent } from './tour-problem-form/tour-problem-form.component';

@NgModule({
  declarations: [
    TourProblemListComponent,
    TourProblemFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule     
  ],
  exports: [
    TourProblemListComponent 
  ]
})
export class TourExecutionModule { }