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
import { TourProblemListAdminComponent } from 'src/app/feature-modules/administration/tour-problem-list-admin/tour-problem-list-admin.component';
import { TourProblemDetailsAdminComponent } from 'src/app/feature-modules/administration/tour-problem-details-admin/tour-problem-details-admin.component';

import { EncounterListComponent } from 'src/app/feature-modules/administration/encounter-list/encounter-list.component';
import { EncounterFormComponent } from 'src/app/feature-modules/administration/encounter-form/encounter-form.component';

import { TourListComponent } from 'src/app/feature-modules/tour-authoring/tour-list/tour-list.component';

import { AppRatingListComponent } from 'src/app/feature-modules/stakeholders/app-rating-list/app-rating-list.component';
import { MyAppRatingComponent } from 'src/app/feature-modules/stakeholders/my-app-rating/my-app-rating.component';
import { ProfileComponent } from 'src/app/feature-modules/stakeholders/profile/profile.component';
import { ProfileListComponent } from 'src/app/feature-modules/stakeholders/profile-list/profile-list.component';
import { ProfileFormComponent } from 'src/app/feature-modules/stakeholders/profile-form/profile-form.component';

import { TourProblemListComponent } from 'src/app/feature-modules/tour-execution/tour-problem-list/tour-problem-list.component';
import { TourProblemDetailsComponent } from 'src/app/feature-modules/tour-execution/tour-problem-details/tour-problem-details.component';
import { AuthorProblemListComponent } from 'src/app/feature-modules/tour-authoring/author-problem-list/author-problem-list.component';
import { AuthorProblemDetailsComponent } from 'src/app/feature-modules/tour-authoring/author-problem-details/author-problem-details.component';
import { PreferenceOverviewComponent } from 'src/app/feature-modules/stakeholders/preferences/preference-overview/preference-overview.component';
import { TouristEquipmentComponent } from 'src/app/feature-modules/stakeholders/tourist-equipment/tourist-equipment.component';
import { TouristToursComponent } from 'src/app/feature-modules/stakeholders/tourist-tours/tourist-tours.component';
import { TouristEncountersComponent } from 'src/app/feature-modules/stakeholders/tourist-encounters/tourist-encounters.component';
import { ShoppingCartComponent } from 'src/app/feature-modules/stakeholders/shopping-cart/shopping-cart.component';
import { MyPurchasedToursComponent } from 'src/app/feature-modules/stakeholders/my-purchased-tours/my-purchased-tours.component'; // t execution
import { RecommendedToursComponent } from 'src/app/feature-modules/stakeholders/preferences/recommended-tours/recommended-tours.component'; //t recommendations

import { MeetupListComponent } from 'src/app/feature-modules/stakeholders/meetups/meetup-list/meetup-list.component';
import { MeetupDetailsComponent } from 'src/app/feature-modules/stakeholders/meetups/meetup-details/meetup-details.component';

import { AllBlogsComponent } from 'src/app/feature-modules/blog/all-blogs/all-blogs.component';
import { BlogListComponent } from 'src/app/feature-modules/blog/blog-list/blog-list.component';
import { KeyPointPageComponent } from 'src/app/feature-modules/tour-authoring/key-points/key-point-page/key-point-page.component';

import { BlogDetailComponent } from 'src/app/feature-modules/blog/blog-detail/blog-detail.component';
import { PurchaseSuccessComponent } from 'src/app/feature-modules/stakeholders/purchase/purchase-success.component';
import { ActiveTourComponent } from 'src/app/feature-modules/tour-execution/active-tour/active-tour.component';
import { TourDetailsComponent } from 'src/app/feature-modules/stakeholders/tour-details/tour-details.component';

import { TourWizardComponent } from 'src/app/feature-modules/tour-authoring/tour-wizard/tour-wizard.component';
import { MyReviewsComponent } from 'src/app/feature-modules/tour-execution/my-reviews/my-reviews.component'; 

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

  // Encounters
  { path: 'administration/encounters', component: EncounterListComponent, canActivate: [AuthGuard] },

  // Admin Tour Problems
  { path: 'administration/tour-problems', component: TourProblemListAdminComponent, canActivate: [AuthGuard] },
  { path: 'administration/tour-problems/:id', component: TourProblemDetailsAdminComponent, canActivate: [AuthGuard] },

  // Tours
  { path: 'author/tours', component: TourListComponent, canActivate: [AuthGuard] },
  { path: 'author/tour-problems', component: AuthorProblemListComponent, canActivate: [AuthGuard] },
  { path: 'author/tour-problems/:id', component: AuthorProblemDetailsComponent, canActivate: [AuthGuard] },

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
  { path: 'tourist/equipment', component: TouristEquipmentComponent, canActivate: [AuthGuard]},
  { path: 'tourist/tours', component: TouristToursComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },
  { path: 'tourist/encounters', component: TouristEncountersComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },
  { path: 'tourist/cart', component: ShoppingCartComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },
  { path: 'tourist/my-tours', component: MyPurchasedToursComponent, canActivate: [AuthGuard], data: { role: 'tourist' } }, //tour execution
  { path: 'tourist/purchase-success',  component: PurchaseSuccessComponent,  canActivate: [AuthGuard],  data: { role: 'tourist' }},
  { path: 'tourist/my-reviews', component: MyReviewsComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },
  // Tour execution
  { path: 'tour-execution/tour-problems', component: TourProblemListComponent, canActivate: [AuthGuard] },
  { path: 'tour-execution/tour-problems/:id', component: TourProblemDetailsComponent, canActivate: [AuthGuard] },
  { path: 'tour-execution/active', component: ActiveTourComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },
  { path: 'tourist/recommended-tours', component: RecommendedToursComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },
  
  // Meetups
  { path: 'meetups', component: MeetupListComponent, canActivate: [AuthGuard] },
  { path: 'meetups/:id', component: MeetupDetailsComponent, canActivate: [AuthGuard] },

  // Blogs (Author & Tourist)
  // Blogs – Public views
  { path: 'blogs', component: AllBlogsComponent, canActivate: [AuthGuard] },
  { path: 'blogs/:id', component: BlogDetailComponent, canActivate: [AuthGuard] },

  // Author – My Blogs
  { path: 'author/blogs', component: BlogListComponent, canActivate: [AuthGuard], data: { role: 'author' } },
  { path: 'author/blogs/:id', component: BlogDetailComponent, canActivate: [AuthGuard], data: { role: 'author' } },

  // Tourist – My Blogs (ako koristiš istu komponentu)
  { path: 'tourist/blogs', component: BlogListComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },
  { path: 'tourist/blogs/:id', component: BlogDetailComponent, canActivate: [AuthGuard], data: { role: 'tourist' } },

  // Authoring
  { path: 'test-keypoints', component: KeyPointPageComponent, canActivate: [AuthGuard], data: { role: 'author' } },
  { path: 'tourist/tours/:id/details', component: TourDetailsComponent, canActivate: [AuthGuard], data: { role: 'tourist' } 
},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}