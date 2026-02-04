import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourStatsCardsComponent } from './tour-stats-cards.component';
import { ComparisonSectionComponent } from './comparison-section.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [TourStatsCardsComponent, ComparisonSectionComponent],
  imports: [CommonModule, MatIconModule],
  exports: [TourStatsCardsComponent, ComparisonSectionComponent]
})
export class TourHistoryModule {}
