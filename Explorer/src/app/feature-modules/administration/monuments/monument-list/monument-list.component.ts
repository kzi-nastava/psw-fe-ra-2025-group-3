import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../../administration.service';
import { Monument, MonumentStatus } from '../../model/monument.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MatDialog } from '@angular/material/dialog';
import { MonumentFormComponent } from '../../monument-form/monument-form.component';

@Component({
  selector: 'xp-monument-list',
  templateUrl: './monument-list.component.html',
  styleUrls: ['./monument-list.component.css']
})
export class MonumentListComponent implements OnInit {

  MonumentStatus = MonumentStatus;
  monuments: Monument[] = [];
  isLoading: boolean = false;

  constructor(
    private service: AdministrationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getMonuments();
  }

  getMonuments(): void {
    this.isLoading = true;

    this.service.getMonuments().subscribe({
      next: (result: PagedResults<Monument>) => {
        this.monuments = result.results;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  deleteMonument(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this monument?');

    if (!confirmed) {
      return;
    }

    this.service.deleteMonument(id).subscribe({
      next: () => this.getMonuments()
    });
  }

  // OTVARANJE FORME U DIALOGU 
  openForm(mode: 'create' | 'edit', monument?: Monument): void {
    const dialogRef = this.dialog.open(MonumentFormComponent, {
      width: '750px',
      data: {
        mode,
        monument: monument ?? null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result može biti npr. true kad je snimanje uspelo
        this.getMonuments();
      }
    });
  }

  onEditClicked(monument: Monument): void {
    this.openForm('edit', monument);
  }

  onAddClicked(): void {
    this.openForm('create');
  }
}
