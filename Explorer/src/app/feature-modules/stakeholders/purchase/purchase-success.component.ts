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

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state;
    
    this.tokens = state?.['tokens'] || [];
    this.purchaseRecords = state?.['purchaseRecords'] || [];
  }

  goExplore(): void {
    this.router.navigate(['/tourist/my-purchased-tours']);
  }
}