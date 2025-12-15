import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';

// TODO: adjust the import to match your project
import { Tour } from '../model/tour.model'; // e.g. '../../tours/model/tour.model'

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
  selectedIndex = 0;
  tourId?: number;

  constructor(
    private dialogRef: MatDialogRef<TourWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TourWizardData,
    private snackBar: MatSnackBar
  ) {
    this.dialogRef.keydownEvents().subscribe(e => {
      if (e.key === 'Escape') {
        this.closeWizard();
      }
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.tour?.id != null) {
      this.tourId = this.data.tour.id;
    }
  }

  get isOnBasics(): boolean {
    return this.selectedIndex === 0;
  }

  get isOnKeyPoints(): boolean {
    return this.selectedIndex === 1;
  }

  get canOpenKeyPoints(): boolean {
    return !!this.tourId;
  }

  back(): void {
    this.goToStep(0);
  }

  goToKeyPoints(): void {
    if (!this.canOpenKeyPoints) {
      this.snackBar.open(
        'Please save the tour first in order to add key points.',
        'OK',
        { duration: 2500 }
      );
      this.goToStep(0);
      return;
    }

    this.goToStep(1);
  }

  private goToStep(index: 0 | 1): void {
    this.selectedIndex = index;

    if (index === 1) {
      this.dispatchResizeSoon();
    }
  }

  private dispatchResizeSoon(): void {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
  }

  cancel(): void {
    this.closeWizard();
  }

  finish(): void {
    this.closeWizard();
  }

  onTourFormSaved(event: { success: boolean; tourId?: number }): void {
    if (!event?.success) return;

    if (event.tourId != null) {
      this.tourId = event.tourId;
    }

    this.goToKeyPoints();
  }

  onTabChange(e: MatTabChangeEvent): void {
    if (e.index === 1 && !this.canOpenKeyPoints) {
      this.snackBar.open(
        'You cannot access key points until the tour is saved.',
        'OK',
        { duration: 2500 }
      );
      Promise.resolve().then(() => (this.selectedIndex = 0));
      return;
    }

    if (e.index === 1) {
      this.dispatchResizeSoon();
    }
  }

  private closeWizard(): void {
    if (this.tourId) {
      // Tour already exists → notify parent to refresh the list
      this.dialogRef.close({ ok: true, tourId: this.tourId });
    } else {
      // Nothing was saved
      this.dialogRef.close(false);
    }
  }
}
