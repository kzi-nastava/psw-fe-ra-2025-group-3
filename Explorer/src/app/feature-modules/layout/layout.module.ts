import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MapTestComponent } from './map-test/map-test.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TouristMapComponent } from './tourist-map/tourist-map.component';
import { NotificationBadgeComponent } from './notification-badge/notification-badge.component';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    HomeComponent,
    NavbarComponent,
    MapTestComponent,
    TouristMapComponent,
    NotificationBadgeComponent,
    NotificationDropdownComponent,
    NotificationItemComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    MatSnackBarModule,
    SharedModule
  ],
  exports: [
    NavbarComponent,
    HomeComponent,
    MapTestComponent
  ]
})
export class LayoutModule { }
