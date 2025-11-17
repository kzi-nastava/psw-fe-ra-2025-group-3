import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentFormComponent } from './equipment-form/equipment-form.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountFormComponent } from './account-form/account-form.component';


@NgModule({
  declarations: [
    EquipmentFormComponent,
    EquipmentComponent,
    AccountListComponent,
    AccountFormComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports: [
    EquipmentComponent,
    EquipmentFormComponent,
    AccountListComponent,
    AccountFormComponent
  ]
})
export class AdministrationModule { }
