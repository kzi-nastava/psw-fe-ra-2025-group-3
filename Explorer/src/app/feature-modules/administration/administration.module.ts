import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentFormComponent } from './equipment-form/equipment-form.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountFormComponent } from './account-form/account-form.component';
import { AwardEventsComponent } from './award-events/award-events.component';
import { AwardEventFormComponent } from './award-event-form/award-event-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    EquipmentFormComponent,
    EquipmentComponent,
    AccountListComponent,
    AccountFormComponent,
    AwardEventsComponent,
    AwardEventFormComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule
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
