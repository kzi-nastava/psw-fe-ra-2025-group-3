import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DiaryRoutingModule } from './diary-routing.module';
import { DiaryListComponent } from './pages/diary-list.component';
import { DiaryFormComponent } from './pages/diary-form.component';

@NgModule({
  declarations: [
    DiaryListComponent,
    DiaryFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DiaryRoutingModule
  ]
})
export class DiaryModule {}
