import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    ReactiveFormsModule,
    RouterModule,
    DiaryRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class DiaryModule {}
