import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../account.service';
import { AccountDto, AccountStatus } from '../model/account.model';
import { MatDialog } from '@angular/material/dialog';
import { AccountFormComponent } from '../account-form/account-form.component';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  accounts: AccountDto[] = [];
  displayedAccounts: AccountDto[] = [];
  accountsPerPage: number = 6;
  currentPage: number = 1;
  isLoading: boolean = false;

  constructor(
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;

    this.accountService.getAllAccounts().subscribe({
      next: (result) => {
        this.accounts = result || [];
        this.updateDisplayed();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.showError('Error loading accounts');
        this.isLoading = false;
      }
    });
  }

  updateDisplayed(): void {
    const endIndex = this.currentPage * this.accountsPerPage;
    this.displayedAccounts = this.accounts.slice(0, endIndex);
  }

  showMore(): void {
    this.currentPage++;
    this.updateDisplayed();
  }

  hasMore(): boolean {
    return this.displayedAccounts.length < this.accounts.length;
  }

  block(account: AccountDto): void {
    if (account.status === AccountStatus.Blocked) {
      this.showError('Account is already blocked');
      return;
    }

    this.accountService.blockAccount(account.id).subscribe({
      next: () => {
        this.showSuccess('Account blocked successfully');
        this.loadAccounts();
      },
      error: () => this.showError('Error blocking account')
    });
  }

  unblock(account: AccountDto): void {
    if (account.status === AccountStatus.Active) {
      this.showError('Account is already active');
      return;
    }

    this.accountService.unblockAccount(account.id).subscribe({
      next: () => {
        this.showSuccess('Account unblocked successfully');
        this.loadAccounts();
      },
      error: () => this.showError('Error unblocking account')
    });
  }

  getStatusClass(status: AccountStatus): string {
    return status === AccountStatus.Active ? 'status-active' : 'status-blocked';
  }

  showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(msg: string): void {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // ---------- DODATO ZA OTVARANJE FORME ----------
  openForm(mode: 'create' | 'edit', account?: AccountDto): void {
    const dialogRef = this.dialog.open(AccountFormComponent, {
      width: '500px',
      data: { mode, account }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAccounts(); // refresh list after create/edit
      }
    });
  }
}
