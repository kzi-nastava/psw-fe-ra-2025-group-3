import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-topup-dialog',
  templateUrl: './admin-topup-dialog.component.html',
  styleUrls: ['./admin-topup-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminTopupDialogComponent {

  amountAc = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1)
  ]);

  constructor(
    private dialogRef: MatDialogRef<AdminTopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { touristUserId: number; fullName: string }
  ) {}

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirm(): void {
    if (this.amountAc.invalid) return;
    this.dialogRef.close({ amountAc: this.amountAc.value });
  }
}