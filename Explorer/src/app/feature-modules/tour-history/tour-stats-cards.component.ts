import { Component, Input } from '@angular/core';
import { TourStatistics, TourComparison } from './tour-history.model';

@Component({
  selector: 'xp-tour-stats-cards',
  templateUrl: './tour-stats-cards.component.html',
  styleUrls: ['./tour-stats-cards.component.css']
})
export class TourStatsCardsComponent {
  @Input() stats?: TourStatistics;
  @Input() comparison?: TourComparison;

  getTotalTime(totalMinutes: number): string {
    if (!totalMinutes || totalMinutes < 1) return '0 min';
    const rounded = Math.round(totalMinutes);
    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;
    
    // If more than 24 hours, convert to days
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      let result = `${days}d`;
      if (remainingHours > 0) {
        result += ` ${remainingHours}h`;
      }
      if (minutes > 0) {
        result += ` ${minutes}min`;
      }
      return result;
    }
    
    if (hours > 0) {
      if (minutes > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${hours}h`;
    }
    return `${minutes} min`;
  }

  getMotivationalMessage(): string {
    if (!this.comparison) return '';
    const percent = Math.abs(Math.round(this.comparison.toursPercentageDifference));
    if (this.comparison.toursPercentageDifference > 20) {
      return `🎉 Amazing! ${percent}% more active than average!`;
    }
    if (this.comparison.toursPercentageDifference > 10) {
      return `⭐ Great job! ${percent}% above average!`;
    }
    if (this.comparison.toursPercentageDifference > 0) {
      return `✓ You're doing well! ${percent}% more than average`;
    }
    if (this.comparison.toursPercentageDifference < -10) {
      return `💪 Keep exploring! You can do it!`;
    }
    return `📈 Start your adventure today!`;
  }
}
