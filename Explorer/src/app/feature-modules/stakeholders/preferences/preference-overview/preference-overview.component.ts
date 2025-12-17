import { Component, OnInit } from '@angular/core';
import { PreferenceService } from '../../preference.service';
import { Preference, TourDifficulty } from '../../model/preference.model';

@Component({
  selector: 'xp-preference-overview',
  templateUrl: './preference-overview.component.html',
  styleUrls: ['./preference-overview.component.css']
})
export class PreferenceOverviewComponent implements OnInit {
  preference: Preference | null = null;
  hasPreference: boolean = false;
  isLoading: boolean = true;
  shouldRenderPreferenceForm: boolean = false;
  shouldEdit: boolean = false;

  constructor(private service: PreferenceService) { }

  ngOnInit(): void {
    this.getPreference();
  }

  getPreference(): void {
    this.isLoading = true;
    this.service.getMyPreferences().subscribe({
      next: (result: Preference) => {
        this.preference = result;
        this.hasPreference = true;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.log('No preferences found');
        this.hasPreference = false;
        this.isLoading = false;
      }
    });
  }

  getDifficultyText(difficulty: TourDifficulty): string {
    switch(difficulty) {
      case TourDifficulty.Easy: return 'Lako';
      case TourDifficulty.Medium: return 'Srednje';
      case TourDifficulty.Hard: return 'Teško';
      default: return 'N/A';
    }
  }

  getDifficultyBadgeClass(difficulty: TourDifficulty): string {
    switch(difficulty) {
      case TourDifficulty.Easy: return 'badge-success';
      case TourDifficulty.Medium: return 'badge-warning';
      case TourDifficulty.Hard: return 'badge-error';
      default: return 'badge-primary';
    }
  }

  getRatingStars(rating: number): string {
    return '⭐'.repeat(rating) + '☆'.repeat(3 - rating);
  }

  onEditClicked(): void {
    this.shouldEdit = true;
    this.shouldRenderPreferenceForm = true;
  }

  onAddClicked(): void {
    this.shouldEdit = false;
    this.shouldRenderPreferenceForm = true;
  }

  deletePreference(): void {
    if (confirm('Da li ste sigurni da želite da obrišete svoje preference?')) {
      this.service.deletePreference().subscribe({
        next: () => {
          this.preference = null;
          this.hasPreference = false;
          this.shouldRenderPreferenceForm = false;
        },
        error: (err: any) => {
          alert('Greška pri brisanju preferenci');
        }
      });
    }
  }
}