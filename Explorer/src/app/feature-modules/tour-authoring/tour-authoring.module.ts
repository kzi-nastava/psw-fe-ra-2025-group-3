import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { TourListComponent } from './tour-list/tour-list.component';
import { TourFormComponent } from './tour-form/tour-form.component';

@NgModule({
  declarations: [
    TourListComponent,
    TourFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule 
  ],
  exports: [
    TourListComponent,
    TourFormComponent
  ]
})
export class TourAuthoringModule { }