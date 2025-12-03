import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TourPurchaseToken } from '../model/tour-purchase-token.model';

@Component({
  selector: 'xp-purchase-success',
  templateUrl: './purchase-success.component.html',
  styleUrls: ['./purchase-success.component.css']
})
export class PurchaseSuccessComponent {
  tokens: TourPurchaseToken[] = [];

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.tokens = nav?.extras.state?.['tokens'] || [];
  }
  goExplore(): void {
  this.router.navigate(['/tourist/tours']);
}

}
