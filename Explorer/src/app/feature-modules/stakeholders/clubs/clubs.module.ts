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
import { ManageHighlightedDialogComponent } from './components/manage-highlighted-dialog/manage-highlighted-dialog.component';
import { ManageMembershipRequestsDialogComponent } from './components/manage-membership-requests-dialog/manage-membership-requests-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list'; 
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';


const routes: Routes = [
  { path: 'clubs', component: ClubListComponent, canActivate: [AuthGuard] },
  { path: 'my-clubs', component: MyClubsComponent, canActivate: [AuthGuard] },
  { path: 'clubs/create', component: ClubListComponent, canActivate: [AuthGuard] }, // create handled via dialog on list
  { path: 'clubs/:id', component: ClubDetailComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [
    ClubListComponent,
    MyClubsComponent,
    ClubDetailComponent,
    ClubFormDialogComponent,
    ManageHighlightedDialogComponent,
    ManageMembershipRequestsDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,       
    MatListModule,    
    MatTooltipModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class ClubsModule { }
