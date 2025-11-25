import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EquipmentFormComponent } from './equipment-form/equipment-form.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountFormComponent } from './account-form/account-form.component';
import { AwardEventsComponent } from './award-events/award-events.component';
import { AwardEventFormComponent } from './award-event-form/award-event-form.component';

import { MaterialModule } from 'src/app/infrastructure/material/material.module';

import { FacilityListComponent } from './facility-list/facility-list.component';
import { FacilityEditComponent } from './facility-edit/facility-edit.component';

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
    AwardEventsComponent,
    AwardEventFormComponent,

    FacilityListComponent,
    FacilityEditComponent    // ✔ ostaje samo edit
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
    MatChipsModule,

    RouterModule
  ],
  exports: [
    EquipmentComponent,
    EquipmentFormComponent,
    AccountListComponent,
    AccountFormComponent,
    AwardEventsComponent,     
    AwardEventFormComponent,

    FacilityListComponent,
    FacilityEditComponent
  ]
})
export class AdministrationModule { }
