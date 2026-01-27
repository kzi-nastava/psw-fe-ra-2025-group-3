import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ManageHighlightedParticipant {
  name: string;
  surname: string;
}

export type ManageHighlightedDialogResult =
  | { action: 'accept'; sessionId: number }
  | { action: 'reject'; sessionId: number }
  | { action: 'close' };

export interface ManageHighlightedDialogData {
  sessions: any[];
  getParticipants?: (sessionId: number) => ManageHighlightedParticipant[];
}

@Component({
  selector: 'xp-manage-highlighted-dialog',
  templateUrl: './manage-highlighted-dialog.component.html',
  styleUrls: ['./manage-highlighted-dialog.component.css']
})
export class ManageHighlightedDialogComponent {
  // Kept intentionally loose so ClubDetail can pass its existing DTOs without mapping.
  sessions: any[] = [];

  /** Optional hook for supplying participants from the caller. */
  getParticipants: (sessionId: number) => ManageHighlightedParticipant[] = () => [];

  private expandedIds = new Set<number>();

  constructor(
    private dialogRef: MatDialogRef<ManageHighlightedDialogComponent, ManageHighlightedDialogResult>,
    @Inject(MAT_DIALOG_DATA) data: ManageHighlightedDialogData
  ) {
    this.sessions = data?.sessions ?? [];
    this.getParticipants = data?.getParticipants ?? (() => []);
  }

  close(): void {
    this.dialogRef.close({ action: 'close' });
  }

  highlightSession(sessionId: number): void {
    this.dialogRef.close({ action: 'accept', sessionId });
  }

  refuseHighlightSession(sessionId: number): void {
    this.dialogRef.close({ action: 'reject', sessionId });
  }

  toggleHighlightParticipants(sessionId: number): void {
    if (this.expandedIds.has(sessionId)) {
      this.expandedIds.delete(sessionId);
    } else {
      this.expandedIds.add(sessionId);
    }
  }

  isHighlightExpanded(sessionId: number): boolean {
    return this.expandedIds.has(sessionId);
  }
}
