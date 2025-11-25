import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MapTestComponent } from './map-test/map-test.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TouristMapComponent } from './tourist-map/tourist-map.component';

@NgModule({
  declarations: [
    HomeComponent,
    NavbarComponent,
    MapTestComponent,
    TouristMapComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    NavbarComponent,
    HomeComponent,
    MapTestComponent
  ]
})
export class LayoutModule { }
