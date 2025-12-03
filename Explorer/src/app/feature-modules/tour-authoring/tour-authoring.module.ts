import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { TourListComponent } from './tour-list/tour-list.component';
import { TourFormComponent } from './tour-form/tour-form.component';
import { AuthorProblemListComponent } from './author-problem-list/author-problem-list.component';
import { AuthorProblemDetailsComponent } from './author-problem-details/author-problem-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TourExecutionModule } from '../tour-execution/tour-execution.module';

@NgModule({
  declarations: [
    TourListComponent,
    TourFormComponent,
    AuthorProblemListComponent,
    AuthorProblemDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    TourExecutionModule
  ],
  exports: [
    TourListComponent,
    TourFormComponent
  ]
})
export class TourAuthoringModule { }