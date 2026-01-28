import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
// --- VRAĆENI IMPORTI ZA DRAG & DROP ---
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TourService } from '../tour.service';
import { Tour, Equipment } from '../model/tour.model';
import { TourFormComponent } from '../tour-form/tour-form.component';

type WizardMode = 'create' | 'edit';

interface TourWizardData {
  mode: WizardMode;
  tour?: Tour;
}

@Component({
  selector: 'xp-tour-wizard',
  templateUrl: './tour-wizard.component.html',
  styleUrls: ['./tour-wizard.component.css'],
})
export class TourWizardComponent implements OnInit {
  @ViewChild(TourFormComponent) tourFormComponent!: TourFormComponent;

  selectedIndex = 0;
  tourId?: number;
  
  // --- OPREMA ---
  allEquipment: Equipment[] = [];
  availableEquipment: Equipment[] = [];
  selectedEquipment: Equipment[] = [];

  // Search filteri
  searchAvailable = '';
  searchSelected = '';

  constructor(
    private dialogRef: MatDialogRef<TourWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TourWizardData,
    private snackBar: MatSnackBar,
    private tourService: TourService
  ) {
    this.dialogRef.keydownEvents().subscribe(e => {
      if (e.key === 'Escape') this.closeWizard();
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.tour?.id != null) {
      this.tourId = this.data.tour.id;
    }
    
    this.tourService.getEquipment().subscribe({
        next: (res) => {
            this.allEquipment = res;
            this.initializeEquipmentLists();
        },
        error: () => console.error('Failed to load equipment')
    });
  }

  private initializeEquipmentLists(): void {
      const tourEquipmentIds = this.data.tour?.equipment?.map(e => e.id) || [];
      this.selectedEquipment = this.allEquipment.filter(e => tourEquipmentIds.includes(e.id));
      this.availableEquipment = this.allEquipment.filter(e => !tourEquipmentIds.includes(e.id));
  }

  drop(event: CdkDragDrop<Equipment[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  // --- KLIK LOGIKA ---
  moveToSelected(item: Equipment): void {
    const index = this.availableEquipment.indexOf(item);
    if (index > -1) {
        this.availableEquipment.splice(index, 1);
        this.selectedEquipment.push(item);
    }
  }

  moveToAvailable(item: Equipment): void {
    const index = this.selectedEquipment.indexOf(item);
    if (index > -1) {
        this.selectedEquipment.splice(index, 1);
        this.availableEquipment.push(item);
    }
  }

  // --- SEARCH FILTER ---
  doesMatchSearch(item: Equipment, search: string): boolean {
      if (!search) return true;
      return item.name.toLowerCase().includes(search.toLowerCase());
  }

  // --- NAVIGACIJA ---
  get isOnBasics(): boolean { return this.selectedIndex === 0; }
  get isOnKeyPoints(): boolean { return this.selectedIndex === 1; }
  get isOnEquipment(): boolean { return this.selectedIndex === 2; }
  get canOpenKeyPoints(): boolean { return !!this.tourId; }

  onNextClick(): void {
      if (this.selectedIndex === 0) {
          if (this.tourFormComponent) this.tourFormComponent.submit();
      } else if (this.selectedIndex === 1) {
          this.goToStep(2);
      }
  }

  onTourFormSaved(event: { success: boolean; tourId?: number }): void {
      if (event.success && event.tourId) {
          this.tourId = event.tourId;
          this.goToStep(1);
      }
  }

  back(): void {
    if (this.selectedIndex > 0) {
      this.goToStep(this.selectedIndex - 1 as 0 | 1 | 2);
    }
  }

  private goToStep(index: 0 | 1 | 2): void {
    this.selectedIndex = index;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  onTabChange(e: MatTabChangeEvent): void {
    if (e.index > 0 && !this.canOpenKeyPoints) {
        this.snackBar.open('Please save the tour first.', 'OK', { duration: 2500 });
        setTimeout(() => this.selectedIndex = 0);
        return;
    }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  cancel(): void { this.closeWizard(); }

  finish(): void {
    if (this.tourId) {
        this.saveEquipmentChanges();
    } else {
        this.closeWizard();
    }
  }

  private saveEquipmentChanges(): void {
    if (!this.tourId) return;

    const originalIds = this.data.tour?.equipment?.map(e => e.id) || [];
    const currentSelectedIds = this.selectedEquipment.map(e => e.id);

    const toAdd = currentSelectedIds.filter(id => !originalIds.includes(id));
    const toRemove = originalIds.filter(id => !currentSelectedIds.includes(id));

    const requests = [
        ...toAdd.map(id => this.tourService.addEquipmentToTour(this.tourId!, id)),
        ...toRemove.map(id => this.tourService.removeEquipmentFromTour(this.tourId!, id))
    ];

    if (requests.length === 0) {
        this.showSuccessAndClose();
        return;
    }

    let completed = 0;
    let errors = false;

    requests.forEach(req => {
        req.subscribe({
            next: () => {
                completed++;
                if (completed === requests.length && !errors) this.showSuccessAndClose();
            },
            error: () => {
                errors = true;
                completed++;
                if (completed === requests.length) {
                    this.snackBar.open('Error saving equipment.', 'Close', { panelClass: ['error-snackbar'] });
                    this.closeWizard(); 
                }
            }
        });
    });
  }

  private showSuccessAndClose() {
     this.snackBar.open('Tour saved successfully!', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
     this.closeWizard();
  }

  private closeWizard(): void {
    this.dialogRef.close({ ok: !!this.tourId, tourId: this.tourId });
  }
}