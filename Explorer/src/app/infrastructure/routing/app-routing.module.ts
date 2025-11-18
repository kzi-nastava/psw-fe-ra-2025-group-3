import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { EquipmentComponent } from 'src/app/feature-modules/administration/equipment/equipment.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { TourListComponent } from 'src/app/feature-modules/tour-authoring/tour-list/tour-list.component'; //Task 8, Sprint 1
import { AccountListComponent } from 'src/app/feature-modules/administration/account-list/account-list.component'; // Task 1, Sprint 1
import { ProfileComponent } from 'src/app/feature-modules/stakeholders/profile/profile.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegistrationComponent},
  {path: 'equipment', component: EquipmentComponent, canActivate: [AuthGuard],},
  {path: 'author/tours', component: TourListComponent,canActivate: [AuthGuard]}, //Task 8, Sprint 1

  { path: 'administration/accounts', component: AccountListComponent, canActivate: [AuthGuard] },//Task 1, Sprint 1


  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }