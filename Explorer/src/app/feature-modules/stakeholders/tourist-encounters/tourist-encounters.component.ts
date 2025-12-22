import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Encounter, EncounterStatus, EncounterType } from '../../administration/model/encounter.model';
import { TouristEncounterService } from './tourist-encounters.service';

@Component({
  selector: 'xp-tourist-encounters',
  templateUrl: './tourist-encounters.component.html',
  styleUrls: ['./tourist-encounters.component.css']
})
export class TouristEncountersComponent implements OnInit {
  encounters: Encounter[] = [];
  mapPoints: { lat: number; lng: number }[] = [];
  isLoading = false;

  constructor(
    private encounterService: TouristEncounterService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadActiveEncounters();
  }

  loadActiveEncounters(): void {
    this.isLoading = true;
    this.encounterService.getActiveEncounters().subscribe({
      next: (data) => {
        this.encounters = data;
        this.mapPoints = data.map(e => ({ 
          lat: e.latitude, 
          lng: e.longitude,
          name: `⭐ ${e.name} - ${e.xp} XP`,
          color: 'red'
        }));
        this.isLoading = false;
      },
      error: () => {
        this.showError('Error loading active encounters');
        this.isLoading = false;
      }
    });
  }

  getTypeIcon(type: EncounterType): string {
    switch (type) {
      case EncounterType.Social:
        return 'people';
      case EncounterType.Location:
        return 'place';
      case EncounterType.Misc:
        return 'help_outline';
      default:
        return 'star';
    }
  }

  getTypeClass(type: EncounterType): string {
    switch (type) {
      case EncounterType.Social:
        return 'type-social';
      case EncounterType.Location:
        return 'type-location';
      case EncounterType.Misc:
        return 'type-misc';
      default:
        return '';
    }
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}
