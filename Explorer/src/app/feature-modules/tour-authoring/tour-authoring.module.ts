import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { TourListComponent } from './tour-list/tour-list.component';
import { TourFormComponent } from './tour-form/tour-form.component';
import { AuthorProblemListComponent } from './author-problem-list/author-problem-list.component';
import { AuthorProblemDetailsComponent } from './author-problem-details/author-problem-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { KeyPointFormComponent } from './key-points/key-point-form/key-point-form.component';
import { KeyPointListComponent } from './key-points/key-point-list/key-point-list.component';
import { KeyPointPageComponent } from './key-points/key-point-page/key-point-page.component';
import { TourExecutionModule } from '../tour-execution/tour-execution.module';
import { TourWizardComponent } from './tour-wizard/tour-wizard.component';
import { TourProblemsDialogComponent } from './tour-problems-dialog/tour-problems-dialog.component';
import { BundleListComponent } from './bundle-list/bundle-list.component';
import { BundleFormComponent } from './bundle-form/bundle-form.component';
import { CouponListComponent } from './coupon-list/coupon-list.component';
import { CouponFormComponent } from './coupon-form/coupon-form.component';
import { SaleListComponent } from './sale-list/sale-list.component';
import { SaleFormComponent } from './sale-form/sale-form.component';

@NgModule({
  declarations: [
    TourListComponent,
    TourFormComponent,
    KeyPointFormComponent,
    KeyPointListComponent,
    KeyPointPageComponent,
    AuthorProblemListComponent,
    AuthorProblemDetailsComponent,
    TourWizardComponent,
    TourProblemsDialogComponent,
    BundleListComponent,
    BundleFormComponent,
    CouponListComponent,
    CouponFormComponent,
    SaleListComponent,
    SaleFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    TourExecutionModule
  ],
  exports: [
    TourListComponent,
    TourFormComponent,
    BundleListComponent,
    SaleListComponent
  ]
})
export class TourAuthoringModule { }