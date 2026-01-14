import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EncounterService } from '../encounter.service';
import { Encounter, EncounterStatus, EncounterType } from '../model/encounter.model';
import { EncounterFormComponent } from '../encounter-form/encounter-form.component';

@Component({
  selector: 'app-encounter-list',
  templateUrl: './encounter-list.component.html',
  styleUrls: ['./encounter-list.component.css']
})
export class EncounterListComponent implements OnInit {

  EncounterStatus = EncounterStatus;
  EncounterType = EncounterType;
  encounters: Encounter[] = [];
  isLoading = true;

  constructor(
    private encounterService: EncounterService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEncounters();
  }

  loadEncounters(): void {
    this.isLoading = true;
    this.encounterService.getAll('admin').subscribe({
      next: (data) => {
        this.encounters = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  deleteEncounter(id: number): void {
    if (!confirm('Are you sure you want to delete this encounter?')) return;

    this.encounterService.delete('admin', id).subscribe(() => {
      this.loadEncounters();
    });
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

  onEditClicked(encounter: Encounter): void {
    this.openForm('edit', encounter);
  }

  onAddClicked(): void {
    this.openForm('create');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft': return 'status-draft';
      case 'Active': return 'status-active';
      case 'Archived': return 'status-archived';
      default: return '';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Misc': return 'type-misc';
      case 'Social': return 'type-social';
      case 'HiddenLocation': return 'type-hidden';
      default: return '';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Misc': return 'extension';
      case 'Social': return 'people';
      case 'HiddenLocation': return 'explore';
      default: return 'help';
    }
  }
  approveEncounter(encounter: Encounter): void {
    if (!encounter.id) return;

    if (encounter.status !== 'PendingApproval') return;

    this.encounterService.approve(encounter.id).subscribe({
      next: () => this.loadEncounters(),
      error: () => alert('Error approving encounter')
    });
  }

  rejectEncounter(encounter: Encounter): void {
    if (!encounter.id) return;

    if (encounter.status !== 'PendingApproval') return;

    if (!confirm('Are you sure you want to reject this encounter?')) return;

    this.encounterService.reject(encounter.id).subscribe({
      next: () => this.loadEncounters(),
      error: () => alert('Error rejecting encounter')
    });
  }
}
