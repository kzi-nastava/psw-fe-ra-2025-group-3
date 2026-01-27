import { Component, Input } from '@angular/core';
import { TourComparison } from './tour-history.model';

@Component({
  selector: 'xp-comparison-section',
  templateUrl: './comparison-section.component.html',
  styleUrls: ['./comparison-section.component.css']
})
export class ComparisonSectionComponent {
  @Input() comparison?: TourComparison;

  getPercentageWidth(yourValue: number, avgValue: number): number {
    const max = Math.max(yourValue, avgValue) * 1.1;
    return (yourValue / max) * 100;
  }

  getAvgPercentageWidth(yourValue: number, avgValue: number): number {
    const max = Math.max(yourValue, avgValue) * 1.1;
    return (avgValue / max) * 100;
  }

  getDifferenceEmoji(percentage: number): string {
    if (percentage > 15) return '🎉';
    if (percentage > 5) return '⭐';
    if (percentage < -15) return '😐';
    if (percentage < -5) return '📈';
    return '✓';
  }

  getDifferenceText(percentage: number): string {
    const absPercent = Math.abs(Math.round(percentage));
    if (percentage > 0) return `+${absPercent}% above average`;
    if (percentage < 0) return `${absPercent}% below average`;
    return 'At average';
  }
}
