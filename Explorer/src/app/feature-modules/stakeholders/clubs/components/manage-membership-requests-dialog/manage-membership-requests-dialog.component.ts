import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type ManageMembershipRequestsDialogResult =
  | { action: 'respond'; requestId: number; accepted: boolean }
  | { action: 'close' };

export interface ManageMembershipRequestsDialogData {
  // Kept loose so it matches your existing DTO without extra mapping.
  requests: any[];
}

@Component({
  selector: 'xp-manage-membership-requests-dialog',
  templateUrl: './manage-membership-requests-dialog.component.html',
  styleUrls: ['./manage-membership-requests-dialog.component.css']
})
export class ManageMembershipRequestsDialogComponent {
  requests: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<
      ManageMembershipRequestsDialogComponent,
      ManageMembershipRequestsDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) data: ManageMembershipRequestsDialogData
  ) {
    this.requests = data?.requests ?? [];
  }

  close(): void {
    this.dialogRef.close({ action: 'close' });
  }

  respond(requestId: number, accepted: boolean): void {
    this.dialogRef.close({ action: 'respond', requestId, accepted });
  }
}
