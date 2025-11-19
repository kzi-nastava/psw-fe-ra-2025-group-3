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
import { AppRatingListComponent } from 'src/app/feature-modules/stakeholders/app-rating-list/app-rating-list.component'; //Task 6, Sprint 1
import { MyAppRatingComponent } from 'src/app/feature-modules/stakeholders/my-app-rating/my-app-rating.component'; //Task 6, Sprint 1
import { TourProblemListComponent } from 'src/app/feature-modules/tour-execution/tour-problem-list/tour-problem-list.component'; //Task 9, Sprint 1
import { PreferenceOverviewComponent } from 'src/app/feature-modules/tour-execution/preference-overview/preference-overview.component';  //Task 11, Sprint 1
import { TouristEquipmentComponent } from 'src/app/feature-modules/tour-execution/tourist-equipment/tourist-equipment.component'; // Task 10, Sprint 1


const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegistrationComponent},
  {path: 'equipment', component: EquipmentComponent, canActivate: [AuthGuard],},
  {path: 'author/tours', component: TourListComponent,canActivate: [AuthGuard]}, //Task 8, Sprint 1

  { path: 'administration/accounts', component: AccountListComponent, canActivate: [AuthGuard] },//Task 1, Sprint 1

  {path: 'app-ratings', component: AppRatingListComponent, canActivate: [AuthGuard]}, //Task 6, Sprint 1
  {path: 'author/app-rating', component: MyAppRatingComponent, canActivate: [AuthGuard], data: {role: 'author'}}, //Task 6, Sprint 1
  {path: 'tourist/app-rating', component: MyAppRatingComponent, canActivate: [AuthGuard], data: {role: 'tourist'}}, //Task 6, Sprint 1

  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'tour-execution/tour-problems', component: TourProblemListComponent, canActivate: [AuthGuard]}, //Task 9, Sprint 1


   {path: 'tourist/preferences', component: PreferenceOverviewComponent, canActivate: [AuthGuard]}, // Preference - Task 11, Sprint 1

   {path: 'tourist/equipment', component: TouristEquipmentComponent, canActivate: [AuthGuard]} // Tourist Equipment - Task 10, Sprint 1


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }