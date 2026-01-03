import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StakeholderService } from 'src/app/feature-modules/stakeholders/stakeholder.service';
import { Person } from 'src/app/feature-modules/stakeholders/model/person.model';
import { AdminTopupDialogComponent } from '../admin-topup-dialog/admin-topup-dialog.component';

@Component({
  selector: 'app-admin-tourists',
  templateUrl: './admin-tourists.component.html',
  styleUrls: ['./admin-tourists.component.css']
})
export class AdminTouristsComponent implements OnInit {

  // isto kao ProfileList
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

  // isto kao ProfileList, samo vuče turiste
  loadPersons(): void {
    this.isLoading = true;

    this.stakeholderService.getAllTourists().subscribe({
      next: (result) => {
        this.persons = result || [];
        this.currentPage = 1;
        this.updateDisplayed();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.showError('Error loading tourists');
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

  getStatusText(person: Person): string {
    return person.isActive ? 'Active' : 'Blocked';
  }

  openTopUp(person: Person): void {
    const dialogRef = this.dialog.open(AdminTopupDialogComponent, {
      width: '610px',
      maxWidth: '94vw',
      autoFocus: false,
      panelClass: 'topup-dialog-panel',
      data: {
        touristUserId: person.userId,
        fullName: `${person.name} ${person.surname}`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.stakeholderService.topUpWallet({
        touristUserId: person.userId,
        amountAc: result.amountAc
      }).subscribe({
        next: (wallet) => {
          this.showSuccess(`Top up successful. New balance: ${wallet.balanceAc} AC`);
        },
        error: (err) => {
          console.error(err);
          this.showError(err?.error?.message || 'Top up failed');
        }
      });
    });
  }

  private showSuccess(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}