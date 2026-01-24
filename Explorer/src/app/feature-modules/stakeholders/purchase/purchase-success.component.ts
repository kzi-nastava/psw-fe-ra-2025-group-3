import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-purchase-success',
  templateUrl: './purchase-success.component.html',
  styleUrls: ['./purchase-success.component.css']
})
export class PurchaseSuccessComponent {
  tokens: any[] = [];
  purchaseRecords: any[] = [];
  bundlePurchaseRecords: any[] = [];
  successMessage: string = '';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state;
    
    this.tokens = state?.['tokens'] || [];
    this.purchaseRecords = state?.['purchaseRecords'] || [];
    this.bundlePurchaseRecords = state?.['bundlePurchaseRecords'] || [];
    this.successMessage = state?.['successMessage'] || '';
  }

  getTotalPaid(): number {
    const tourTotal = this.purchaseRecords.reduce((sum, record) => sum + (record.priceAc || 0), 0);
    const bundleTotal = this.bundlePurchaseRecords.reduce((sum, record) => sum + (record.priceAc || 0), 0);
    return tourTotal + bundleTotal;
  }

  goExplore(): void {
    this.router.navigate(['/tourist/my-tours']);
  }
}