import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentFormComponent } from './equipment-form/equipment-form.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountFormComponent } from './account-form/account-form.component';

import { MonumentListComponent } from './monuments/monument-list/monument-list.component';
import { MonumentFormComponent } from './monument-form/monument-form.component';


import { AwardEventsComponent } from './award-events/award-events.component';
import { AwardEventFormComponent } from './award-event-form/award-event-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatChipsModule } from '@angular/material/chips'; 


@NgModule({
  declarations: [
    EquipmentFormComponent,
    EquipmentComponent,
    AccountListComponent,
    AccountFormComponent,
    MonumentListComponent,
    MonumentFormComponent,
    AwardEventsComponent,
    AwardEventFormComponent

  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule
  ],
  exports: [
    EquipmentComponent,
    EquipmentFormComponent,
    AccountListComponent,
    AccountFormComponent,
    AwardEventsComponent,     
    AwardEventFormComponent
  ]
})
export class AdministrationModule { }
