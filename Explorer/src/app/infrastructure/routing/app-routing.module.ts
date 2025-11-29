import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';

import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { RegistrationComponent } from '../auth/registration/registration.component';

import { MapTestComponent } from 'src/app/feature-modules/layout/map-test/map-test.component';
import { TouristMapComponent } from 'src/app/feature-modules/layout/tourist-map/tourist-map.component';

import { EquipmentComponent } from 'src/app/feature-modules/administration/equipment/equipment.component';
import { AccountListComponent } from 'src/app/feature-modules/administration/account-list/account-list.component';

import { AwardEventsComponent } from 'src/app/feature-modules/administration/award-events/award-events.component';
import { MonumentListComponent } from 'src/app/feature-modules/administration/monuments/monument-list/monument-list.component';

import { FacilityListComponent } from 'src/app/feature-modules/administration/facility-list/facility-list.component';
import { FacilityEditComponent } from 'src/app/feature-modules/administration/facility-edit/facility-edit.component';

import { TourListComponent } from 'src/app/feature-modules/tour-authoring/tour-list/tour-list.component';

import { AppRatingListComponent } from 'src/app/feature-modules/stakeholders/app-rating-list/app-rating-list.component';
import { MyAppRatingComponent } from 'src/app/feature-modules/stakeholders/my-app-rating/my-app-rating.component';
import { ProfileComponent } from 'src/app/feature-modules/stakeholders/profile/profile.component';
import { ProfileListComponent } from 'src/app/feature-modules/stakeholders/profile-list/profile-list.component';
import { ProfileFormComponent } from 'src/app/feature-modules/stakeholders/profile-form/profile-form.component';

import { TourProblemListComponent } from 'src/app/feature-modules/tour-execution/tour-problem-list/tour-problem-list.component';
import { PreferenceOverviewComponent } from 'src/app/feature-modules/stakeholders/preferences/preference-overview/preference-overview.component';
import { TouristEquipmentComponent } from 'src/app/feature-modules/tour-execution/tourist-equipment/tourist-equipment.component';

import { MeetupListComponent } from 'src/app/feature-modules/stakeholders/meetups/meetup-list/meetup-list.component';
import { MeetupDetailsComponent } from 'src/app/feature-modules/stakeholders/meetups/meetup-details/meetup-details.component';

import { BlogListComponent } from 'src/app/feature-modules/blog/blog-list/blog-list.component';

const routes: Routes = [

  // Public
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },

  { path: 'map-test', component: MapTestComponent },

  // Admin
  { path: 'equipment', component: EquipmentComponent, canActivate: [AuthGuard] },
  { path: 'administration/accounts', component: AccountListComponent, canActivate: [AuthGuard] },
  { path: 'administration/award-events', component: AwardEventsComponent, canActivate: [AuthGuard] },
  { path: 'administration/monuments', component: MonumentListComponent, canActivate: [AuthGuard] },

  // Facilities
  { path: 'administration/facilities', component: FacilityListComponent, canActivate: [AuthGuard] },
  { path: 'administration/facilities/new', component: FacilityEditComponent, canActivate: [AuthGuard] },
  { path: 'administration/facilities/edit/:id', component: FacilityEditComponent, canActivate: [AuthGuard] },

  // Tours
  { path: 'author/tours', component: TourListComponent, canActivate: [AuthGuard] },

  // Ratings
  { path: 'app-ratings', component: AppRatingListComponent, canActivate: [AuthGuard] },
  { path: 'author/app-rating', component: MyAppRatingComponent, canActivate: [AuthGuard], data: { role: 'author' } },
  { path: 'tourist/app-rating', component: MyAppRatingComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },

  // Profile
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'administration/profiles', component: ProfileListComponent, canActivate: [AuthGuard] },
  { path: 'administration/profile-form', component: ProfileFormComponent, canActivate: [AuthGuard] },

  // Tourist-only features
  { path: 'tourist/map', component: TouristMapComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },
  { path: 'tourist/preferences', component: PreferenceOverviewComponent, canActivate: [AuthGuard] },
  { path: 'tourist/equipment', component: TouristEquipmentComponent, canActivate: [AuthGuard] },

  // Tour execution
  { path: 'tour-execution/tour-problems', component: TourProblemListComponent, canActivate: [AuthGuard] },

  // Meetups
  { path: 'meetups', component: MeetupListComponent, canActivate: [AuthGuard] },
  { path: 'meetups/:id', component: MeetupDetailsComponent, canActivate: [AuthGuard] },

  // Blogs (Author & Tourist)
  { path: 'author/blogs', component: BlogListComponent, canActivate: [AuthGuard], data: { role: 'author' } },
  { path: 'tourist/blogs', component: BlogListComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
