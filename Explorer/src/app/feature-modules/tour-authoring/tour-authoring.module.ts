import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { TourListComponent } from './tour-list/tour-list.component';
import { TourFormComponent } from './tour-form/tour-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { KeyPointFormComponent } from './key-points/key-point-form/key-point-form.component';
import { KeyPointListComponent } from './key-points/key-point-list/key-point-list.component';
import { KeyPointPageComponent } from './key-points/key-point-page/key-point-page.component';

@NgModule({
  declarations: [
    TourListComponent,
    TourFormComponent,
    KeyPointFormComponent,
    KeyPointListComponent,
    KeyPointPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  exports: [
    TourListComponent,
    TourFormComponent
  ]
})
export class TourAuthoringModule { }