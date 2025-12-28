import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Encounter, EncounterStatus, EncounterType } from '../../administration/model/encounter.model';
import { TouristEncounterService } from './tourist-encounters.service';
import { EncounterActivationService } from './encounter-activation.service';
import { 
  NearbyEncounterDto, 
  EncounterActivationDto, 
  EncounterActivationStatus 
} from '../model/encounter-activation.model';

@Component({
  selector: 'xp-tourist-encounters',
  templateUrl: './tourist-encounters.component.html',
  styleUrls: ['./tourist-encounters.component.css']
})
export class TouristEncountersComponent implements OnInit {
  encounters: NearbyEncounterDto[] = [];
  activeEncounterIds: Set<number> = new Set();
  mapPoints: { lat: number; lng: number; name?: string; color?: string }[] = [];
  isLoading = false;
  selectedPoint: { lat: number; lng: number } | null = null;
  myPosition: { lat: number; lng: number } | null = null;
  positionMarker: { lat: number; lng: number; name?: string; color?: string } | null = null;

  constructor(
    private encounterService: TouristEncounterService,
    private activationService: EncounterActivationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMyPosition();
    this.loadNearbyEncounters();
    this.loadActiveEncounterActivations();
  }

  loadMyPosition(): void {
    this.activationService.getMyPosition().subscribe({
      next: (position) => {
        if (position) {
          this.myPosition = { lat: position.latitude, lng: position.longitude };
          this.updatePositionMarker();
        }
      },
      error: (err) => {
        console.log('Position not set yet', err);
      }
    });
  }

  loadNearbyEncounters(): void {
    this.isLoading = true;
    this.activationService.getNearbyEncounters(100).subscribe({
      next: (data) => {
        this.encounters = data;
        this.updateMapPoints();
        this.isLoading = false;
      },
      error: () => {
        this.showError('Error loading nearby encounters');
        this.isLoading = false;
      }
    });
  }

  loadActiveEncounterActivations(): void {
    this.activationService.getActiveEncounters().subscribe({
      next: (activations) => {
        this.activeEncounterIds = new Set(activations.map(a => a.encounterId));
      },
      error: (err) => {
        console.error('Error loading active encounter activations', err);
      }
    });
  }

  updateMapPoints(): void {
    // Encounter markers with different colors based on status
    this.mapPoints = this.encounters.map(e => {
      let color = 'grey'; // Default: too far
      
      if (e.isCompleted) {
        color = 'green'; // Completed
      } else if (this.isEncounterActive(e.id)) {
        color = 'yellow'; // In progress
      } else if (e.canActivate) {
        color = 'red'; // Can activate
      }

      return {
        lat: e.latitude,
        lng: e.longitude,
        name: `${e.name} - ${e.xp} XP`,
        color: color
      };
    });

    // Add position marker if exists
    if (this.positionMarker) {
      this.mapPoints.push(this.positionMarker);
    }
  }

  updatePositionMarker(): void {
    if (this.myPosition) {
      this.positionMarker = {
        lat: this.myPosition.lat,
        lng: this.myPosition.lng,
        name: '📍 My Position',
        color: 'blue'
      };
      this.updateMapPoints();
    }
  }

  onPointSelected(point: { lat: number; lng: number }): void {
    this.selectedPoint = point;
  }

  savePosition(): void {
    if (!this.selectedPoint) {
      this.showError('Please select a position on the map first');
      return;
    }

    this.activationService.updatePosition(this.selectedPoint.lat, this.selectedPoint.lng).subscribe({
      next: () => {
        this.myPosition = { ...this.selectedPoint! };
        this.updatePositionMarker();
        this.showSuccess('Position saved successfully!');
        this.loadNearbyEncounters(); // Reload to get updated distances
      },
      error: (err) => {
        console.error('Error updating position', err);
        this.showError('Failed to update position');
      }
    });
  }

  activateEncounter(encounterId: number): void {
    this.activationService.activateEncounter(encounterId).subscribe({
      next: () => {
        this.showSuccess('Encounter activated! Good luck!');
        this.activeEncounterIds.add(encounterId);
        this.updateMapPoints();
      },
      error: (err) => {
        this.handleActivationError(err);
      }
    });
  }

  completeEncounter(encounterId: number): void {
    this.activationService.completeEncounter(encounterId).subscribe({
      next: (result) => {
        this.showSuccess(`Encounter completed! You earned XP!`);
        this.activeEncounterIds.delete(encounterId);
        this.loadNearbyEncounters(); // Reload to update completion status
      },
      error: (err) => {
        console.error('Error completing encounter', err);
        this.showError('Failed to complete encounter');
      }
    });
  }

  abandonEncounter(encounterId: number): void {
    this.activationService.abandonEncounter(encounterId).subscribe({
      next: () => {
        this.showSuccess('Encounter abandoned');
        this.activeEncounterIds.delete(encounterId);
        this.updateMapPoints();
      },
      error: (err) => {
        console.error('Error abandoning encounter', err);
        this.showError('Failed to abandon encounter');
      }
    });
  }

  isEncounterActive(encounterId: number): boolean {
    return this.activeEncounterIds.has(encounterId);
  }

  getDistanceText(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m away`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)}km away`;
  }

  getStatusText(encounter: NearbyEncounterDto): string {
    if (encounter.isCompleted) {
      return 'Completed';
    }
    if (this.isEncounterActive(encounter.id)) {
      return 'In Progress';
    }
    if (encounter.canActivate) {
      return 'Can Activate';
    }
    if (!this.myPosition) {
      return 'Set position first';
    }
    return 'Too Far';
  }

  getStatusClass(encounter: NearbyEncounterDto): string {
    if (encounter.isCompleted) {
      return 'status-completed';
    }
    if (this.isEncounterActive(encounter.id)) {
      return 'status-in-progress';
    }
    if (encounter.canActivate) {
      return 'status-can-activate';
    }
    return 'status-too-far';
  }

  canShowActivateButton(encounter: NearbyEncounterDto): boolean {
    return encounter.canActivate && !encounter.isCompleted && !this.isEncounterActive(encounter.id);
  }

  canShowActionButtons(encounter: NearbyEncounterDto): boolean {
    return this.isEncounterActive(encounter.id) && !encounter.isCompleted;
  }

  handleActivationError(err: any): void {
    const errorMsg = err.error?.message || err.message || '';
    
    if (err.status === 400) {
      if (errorMsg.includes('position not found') || errorMsg.includes('Position')) {
        this.showError('Please set your position on the map first');
      } else if (errorMsg.includes('too far') || errorMsg.includes('distance')) {
        this.showError('You are too far from this encounter (max 100m)');
      } else if (errorMsg.includes('already completed')) {
        this.showError('You have already completed this encounter');
      } else if (errorMsg.includes('already active')) {
        this.showError('This encounter is already active');
      } else {
        this.showError('Cannot activate encounter: ' + errorMsg);
      }
    } else if (err.status === 404) {
      this.showError('Encounter not found');
    } else {
      this.showError('Failed to activate encounter');
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Social':
        return 'people';
      case 'Location':
        return 'place';
      case 'Misc':
        return 'help_outline';
      default:
        return 'star';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Social':
        return 'type-social';
      case 'Location':
        return 'type-location';
      case 'Misc':
        return 'type-misc';
      default:
        return '';
    }
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }
}
