import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { AuthGuard } from 'src/app/infrastructure/auth/auth.guard';
import { ClubListComponent } from './components/club-list/club-list.component';
import { MyClubsComponent } from './components/my-clubs/my-clubs.component';
import { ClubDetailComponent } from './components/club-detail/club-detail.component';
import { ClubFormDialogComponent } from './components/club-form-dialog/club-form-dialog.component';

const routes: Routes = [
  { path: 'clubs', component: ClubListComponent, canActivate: [AuthGuard] },
  { path: 'clubs/my', component: MyClubsComponent, canActivate: [AuthGuard] },
  { path: 'clubs/create', component: ClubListComponent, canActivate: [AuthGuard] }, // create handled via dialog on list
  { path: 'clubs/:id', component: ClubDetailComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [
    ClubListComponent,
    MyClubsComponent,
    ClubDetailComponent,
    ClubFormDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class ClubsModule { }
