import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';


import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Equipment
import { EquipmentComponent } from './equipment/equipment.component';
import { EquipmentFormComponent } from './equipment-form/equipment-form.component';

// Accounts
import { AccountListComponent } from './account-list/account-list.component';
import { AccountFormComponent } from './account-form/account-form.component';

// Monuments
import { MonumentListComponent } from './monuments/monument-list/monument-list.component';
import { MonumentFormComponent } from './monument-form/monument-form.component';

// Award Events
import { AwardEventsComponent } from './award-events/award-events.component';
import { AwardEventFormComponent } from './award-event-form/award-event-form.component';

// Facilities
import { FacilityListComponent } from './facility-list/facility-list.component';
import { FacilityEditComponent } from './facility-edit/facility-edit.component';

// Tour Problems Admin
import { TourProblemListAdminComponent } from './tour-problem-list-admin/tour-problem-list-admin.component';
import { TourProblemDetailsAdminComponent } from './tour-problem-details-admin/tour-problem-details-admin.component';

@NgModule({
  declarations: [
    EquipmentComponent,
    EquipmentFormComponent,
    AccountListComponent,
    AccountFormComponent,
    MonumentListComponent,
    MonumentFormComponent,
    AwardEventsComponent,
    AwardEventFormComponent,
    FacilityListComponent,
    FacilityEditComponent,
    TourProblemListAdminComponent,
    TourProblemDetailsAdminComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule
  ],
  exports: [
    EquipmentComponent,
    EquipmentFormComponent,
    AccountListComponent,
    AwardEventsComponent,
    AwardEventFormComponent,
    FacilityListComponent,
    FacilityEditComponent
  ]
})
export class AdministrationModule { }
