import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Encounter, EncounterStatus, EncounterType } from '../../administration/model/encounter.model';
import { TouristEncounterService } from './tourist-encounters.service';
import { EncounterActivationService } from './encounter-activation.service';
import { 
  NearbyEncounterDto, 
  EncounterActivationDto, 
  EncounterActivationStatus 
} from '../model/encounter-activation.model';
import { MatDialog } from '@angular/material/dialog';
import { EncounterFormComponent } from '../../administration/encounter-form/encounter-form.component';


@Component({
  selector: 'xp-tourist-encounters',
  templateUrl: './tourist-encounters.component.html',
  styleUrls: ['./tourist-encounters.component.css']
})
export class TouristEncountersComponent implements OnInit, OnDestroy {

  canAddEncounter: boolean = true;

  encounters: NearbyEncounterDto[] = [];
  activeEncounterIds: Set<number> = new Set();
  mapPoints: { lat: number; lng: number; name?: string; color?: string }[] = [];
  isLoading = false;
  selectedPoint: { lat: number; lng: number } | null = null;
  myPosition: { lat: number; lng: number } | null = null;
  currentZoom: number = 15;
  selectedFilter: string | null = null; // null = show all
  highlightedEncounterId: number | null = null;

  // Refresh interval for checking encounter status
  refreshIntervalId: any = null;

  constructor(
    private encounterService: TouristEncounterService,
    private activationService: EncounterActivationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // turist: pitaj backend
    this.encounterService.canTouristCreate().subscribe({
      next: ok => this.canAddEncounter = ok,
      error: () => this.canAddEncounter = false
    });

    this.loadMyPosition();
    this.loadActiveEncounterActivations();
    this.loadEncounters();
    
    // Refresh encounter list every 30 seconds to check for auto-completed encounters
    // Backend tracks position automatically through GetNearbyEncounters
    // Only the list updates, not the entire page (Angular change detection)
    this.refreshIntervalId = setInterval(() => {
      if (this.activeEncounterIds.size > 0) {
        // Just refresh encounter list to see if any were auto-completed by backend
        this.loadEncounters();
      }
    }, 30000); // 30 seconds
  }

  ngOnDestroy(): void {
    // Clean up refresh interval
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
  }

  loadEncounters(): void {
    console.log('🔄 loadEncounters called, active:', this.activeEncounterIds.size);
    // First check if position is already loaded
    if (this.myPosition) {
      this.loadNearbyEncounters();
    } else {
      // Try to load position first, then encounters
      this.activationService.getMyPosition().subscribe({
        next: (position) => {
          if (position) {
            this.myPosition = { lat: position.latitude, lng: position.longitude };
            this.loadNearbyEncounters();
          } else {
            // No position, load all active encounters without distance
            this.loadActiveEncountersWithoutDistance();
          }
        },
        error: () => {
          // No position, load all active encounters without distance
          this.loadActiveEncountersWithoutDistance();
        }
      });
    }
  }

  loadActiveEncountersWithoutDistance(): void {
    this.isLoading = true;
    this.encounterService.getActiveEncounters().subscribe({
      next: (activeEncounters) => {
        console.log('🌍 Active encounters loaded (no distance):', activeEncounters);
        // Convert to NearbyEncounterDto format without distance info
        this.encounters = activeEncounters.map(e => ({
          id: e.id!,
          name: e.name,
          description: e.description,
          latitude: e.latitude,
          longitude: e.longitude,
          xp: e.xp,
          type: e.type as any,
          distanceInMeters: 0,
          canActivate: false,
          isCompleted: false
        }));
        console.log('📋 Mapped encounters:', this.encounters);
        this.updateMapPoints();
        this.isLoading = false;
      },
      error: () => {
        this.showError('Error loading encounters');
        this.isLoading = false;
      }
    });
  }

  loadMyPosition(): void {
    this.activationService.getMyPosition().subscribe({
      next: (position) => {
        if (position) {
          this.myPosition = { lat: position.latitude, lng: position.longitude };
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
        // Only log when there are active encounters (reduce console spam)
        if (this.activeEncounterIds.size > 0) {
          console.table(data.map(e => ({ 
            name: e.name, 
            type: e.type,
            canActivate: e.canActivate, 
            distance: e.distanceInMeters + 'm',
            isCompleted: e.isCompleted,
            isActive: this.activeEncounterIds.has(e.id)
          })));
        }
        this.encounters = data;
        this.updateMapPoints();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading nearby encounters', err);
        // If error is because position is not set, load without distance
        if (err.status === 400 || err.status === 404) {
          this.loadActiveEncountersWithoutDistance();
        } else {
          this.showError('Error loading encounters');
          this.isLoading = false;
        }
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
    // Hidden Location encounters are NOT shown on the map (tourists should not see their location)
    this.mapPoints = this.encounters
      .filter(e => {
        // Exclude Hidden Location encounters completely from map
        if (e.type === 'HiddenLocation') {
          return false;
        }
        // Also exclude if coordinates are 0,0 (might be Hidden Location)
        if (e.latitude === 0 && e.longitude === 0) {
          return false;
        }
        return true;
      })
      .map(e => {
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
          color: color,
          id: e.id // Add ID for marker click identification
        };
      });

    // Don't add position/selected markers through points
    // They are handled by initialPoint binding which creates the draggable marker
  }

  onPointSelected(point: { lat: number; lng: number }): void {
    this.selectedPoint = point;
    // The map's initialPoint binding will automatically update the draggable marker
  }

  onZoomChanged(zoom: number): void {
    this.currentZoom = zoom;
  }

  getFilteredAndSortedEncounters(): NearbyEncounterDto[] {
    let filtered = this.encounters;

    // Apply filter - if no filter selected, show all
    if (this.selectedFilter) {
      filtered = this.encounters.filter(e => {
        if (this.selectedFilter === 'in-progress') {
          return this.isEncounterActive(e.id) && !e.isCompleted;
        } else if (this.selectedFilter === 'can-activate') {
          return e.canActivate && !e.isCompleted && !this.isEncounterActive(e.id);
        } else if (this.selectedFilter === 'too-far') {
          return !e.canActivate && !e.isCompleted && !this.isEncounterActive(e.id) && this.myPosition;
        } else if (this.selectedFilter === 'completed') {
          return e.isCompleted;
        }
        return true;
      });
    }

    // Sort by priority: In Progress > Can Activate > Too Far > Completed
    return filtered.sort((a, b) => {
      const getPriority = (encounter: NearbyEncounterDto): number => {
        if (this.isEncounterActive(encounter.id) && !encounter.isCompleted) {
          return 1; // In Progress
        } else if (encounter.canActivate && !encounter.isCompleted && !this.isEncounterActive(encounter.id)) {
          return 2; // Can Activate
        } else if (!encounter.canActivate && !encounter.isCompleted && !this.isEncounterActive(encounter.id)) {
          return 3; // Too Far
        } else {
          return 4; // Completed
        }
      };

      return getPriority(a) - getPriority(b);
    });
  }

  toggleFilter(filter: string): void {
    // If clicking the same filter, deselect it (show all)
    if (this.selectedFilter === filter) {
      this.selectedFilter = null;
    } else {
      // Otherwise, select the new filter
      this.selectedFilter = filter;
    }
  }

  isFilterActive(filter: string): boolean {
    return this.selectedFilter === filter;
  }

  onMarkerClick(markerId: number): void {
    // Clear filter to show all encounters
    this.selectedFilter = null;
    
    // Highlight the encounter
    this.highlightedEncounterId = markerId;
    
    // Scroll to the encounter card
    setTimeout(() => {
      const element = document.getElementById(`encounter-${markerId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        this.highlightedEncounterId = null;
      }, 3000);
    }, 100);
  }

  savePosition(): void {
    if (!this.selectedPoint) {
      this.showError('Please select a position on the map first');
      return;
    }

    this.activationService.updatePosition(this.selectedPoint.lat, this.selectedPoint.lng).subscribe({
      next: () => {
        this.myPosition = { ...this.selectedPoint! };
        // Don't clear selectedPoint immediately to avoid triggering initialPoint change
        // It will be cleared on next map click
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
        this.showSuccess('Encounter activated! Backend will track it automatically.');
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
      case 'Misc':
        return 'help_outline';
      case 'Social':
        return 'people';
      case 'HiddenLocation':
        return 'explore';
      default:
        return 'star';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Misc':
        return 'type-misc';
      case 'Social':
        return 'type-social';
      case 'HiddenLocation':
        return 'type-hidden';
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

  onAddClicked(): void {
    this.openForm('create', undefined, 'tourist');
  }
    
  openForm(mode: 'create' | 'edit', encounter?: Encounter, actor: 'admin' | 'tourist' = 'admin'): void {
    const dialogRef = this.dialog.open(EncounterFormComponent, {
      width: '800px',
      data: {
        mode,
        encounter: encounter ?? null,
        actor
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEncounters();
      }
    });
  }
}
