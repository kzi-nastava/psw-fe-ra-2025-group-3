import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaleService } from '../sale.service';
import { Sale } from '../model/sale.model';
import { SaleFormComponent } from '../sale-form/sale-form.component';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css']
})
export class SaleListComponent implements OnInit {
  sales: Sale[] = [];
  displayedSales: Sale[] = [];
  salesPerPage: number = 6;
  currentPage: number = 1;
  isLoading: boolean = false;

  constructor(
    private saleService: SaleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.isLoading = true;
    this.saleService.getMySales().subscribe({
      next: (result) => {
        this.sales = result || [];
        this.updateDisplayedSales();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.showError('Error loading sales');
        this.sales = [];
        this.displayedSales = [];
        this.isLoading = false;
      }
    });
  }

  updateDisplayedSales(): void {
    if (!this.sales || this.sales.length === 0) {
      this.displayedSales = [];
      return;
    }
    const endIndex = this.currentPage * this.salesPerPage;
    this.displayedSales = this.sales.slice(0, endIndex);
  }

  showMore(): void {
    this.currentPage++;
    this.updateDisplayedSales();
  }

  hasMoreSales(): boolean {
    return this.sales && this.displayedSales && 
           this.displayedSales.length < this.sales.length;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '800px',
      data: { mode: 'create' },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSales();
      }
    });
  }

  openEditDialog(sale: Sale): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '800px',
      data: { mode: 'edit', sale: sale },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSales();
      }
    });
  }

  deleteSale(sale: Sale): void {
    if (confirm('Are you sure you want to delete this sale?')) {
      this.saleService.deleteSale(sale.id).subscribe({
        next: () => {
          this.showSuccess('Sale successfully deleted');
          this.loadSales();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.showError('Error deleting sale');
        }
      });
    }
  }

  isActive(sale: Sale): boolean {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    return now >= start && now <= end;
  }

  isUpcoming(sale: Sale): boolean {
    const now = new Date();
    const start = new Date(sale.startDate);
    return now < start;
  }

  isExpired(sale: Sale): boolean {
    const now = new Date();
    const end = new Date(sale.endDate);
    return now > end;
  }

  getStatusLabel(sale: Sale): string {
    if (this.isActive(sale)) return 'Active';
    if (this.isUpcoming(sale)) return 'Upcoming';
    if (this.isExpired(sale)) return 'Expired';
    return 'Unknown';
  }

  getStatusClass(sale: Sale): string {
    if (this.isActive(sale)) return 'status-active';
    if (this.isUpcoming(sale)) return 'status-upcoming';
    if (this.isExpired(sale)) return 'status-expired';
    return '';
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
