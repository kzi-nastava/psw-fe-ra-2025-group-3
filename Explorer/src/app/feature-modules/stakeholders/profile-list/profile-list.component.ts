import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StakeholderService } from '../stakeholder.service';
import { Person } from '../model/person.model';
import { MatDialog } from '@angular/material/dialog';
import { ProfileFormComponent } from '../profile-form/profile-form.component';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.css']
})
export class ProfileListComponent implements OnInit {

  persons: Person[] = [];
  displayedPersons: Person[] = [];
  itemsPerPage: number = 6;
  currentPage: number = 1;
  isLoading: boolean = false;

  constructor(
    private stakeholderService: StakeholderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPersons();
  }

  loadPersons(): void {
    this.isLoading = true;

    this.stakeholderService.getAllPersons().subscribe({
      next: (result) => {
        this.persons = result || [];
        this.updateDisplayed();
        this.isLoading = false;
      },
      error: () => {
        this.showError('Error loading persons');
        this.isLoading = false;
      }
    });
  }

  updateDisplayed(): void {
    const endIndex = this.currentPage * this.itemsPerPage;
    this.displayedPersons = this.persons.slice(0, endIndex);
  }

  showMore(): void {
    this.currentPage++;
    this.updateDisplayed();
  }

  hasMore(): boolean {
    return this.displayedPersons.length < this.persons.length;
  }

  block(person: Person): void {
  this.stakeholderService.blockPerson(person.userId).subscribe({
    next: () => {
      this.showSuccess('Person blocked successfully');
      // REFRESH liste da se dobije ažurirani isActive
      this.loadPersons();
    },
    error: (err) => {
      console.error(err);
      this.showError('Error blocking this person: ' + (err.error?.message || err.statusText));
    }
  });
}

 unblock(person: Person): void {
  this.stakeholderService.unblockPerson(person.userId).subscribe({
    next: () => {
      this.showSuccess('Person unblocked successfully');
      // REFRESH liste da se dobije ažurirani isActive
      this.loadPersons();
    },
    error: (err) => {
      console.error(err);
      this.showError('Error unblocking this person: ' + (err.error?.message || err.statusText));
    }
  });
}


  getStatusText(person: Person): string {
    return person.isActive ? 'Active' : 'Blocked';
  }

  openForm(mode: 'create' | 'edit', person?: Person): void {
    const dialogRef = this.dialog.open(ProfileFormComponent, {
      width: '500px',
      data: { mode, person }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPersons();
      }
    });
  }

  private showSuccess(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}
