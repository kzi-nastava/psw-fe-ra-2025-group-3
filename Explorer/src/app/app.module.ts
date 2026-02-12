import { TourHistoryModule } from './feature-modules/tour-history/tour-history.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './infrastructure/routing/app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from './feature-modules/layout/layout.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './infrastructure/material/material.module';
import { AdministrationModule } from './feature-modules/administration/administration.module';
import { BlogModule } from './feature-modules/blog/blog.module';
import { MarketplaceModule } from './feature-modules/marketplace/marketplace.module';
import { TourAuthoringModule } from './feature-modules/tour-authoring/tour-authoring.module';
import { TourExecutionModule } from './feature-modules/tour-execution/tour-execution.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './infrastructure/auth/jwt/jwt.interceptor';
import { StakeholdersModule } from './feature-modules/stakeholders/stakeholders-module';
import { MarkdownModule } from 'ngx-markdown';
import { DiaryModule } from './feature-modules/tour-execution/diary/diary.module';
import { MyWalletComponent } from './feature-modules/stakeholders/my-wallet/my-wallet.component';
import { MyWalletTransactionsComponent } from './feature-modules/stakeholders/my-wallet-transactions/my-wallet-transactions.component';
import { TourHistoryComponent } from './feature-modules/tour-history/tour-history/tour-history.component';


@NgModule({
  declarations: [
    AppComponent,
    MyWalletComponent,
    MyWalletComponent,
    MyWalletComponent,
    MyWalletTransactionsComponent,
    TourHistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,   
    LayoutModule,
    DiaryModule,
    BrowserAnimationsModule,
    MaterialModule,
    AdministrationModule,
    BlogModule,
    MarketplaceModule,
    TourAuthoringModule,
    TourExecutionModule,
    AuthModule,
    HttpClientModule,
    StakeholdersModule,
    MarkdownModule.forRoot(),

    TourHistoryModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
