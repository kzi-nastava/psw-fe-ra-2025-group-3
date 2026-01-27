import { Component, OnInit } from '@angular/core';
import { WalletService } from '../wallet.service';
import { WalletDto } from '../model/wallet.model';

@Component({
  selector: 'xp-my-wallet',
  templateUrl: './my-wallet.component.html',
  styleUrls: ['./my-wallet.component.css']
})
export class MyWalletComponent implements OnInit {
  wallet: WalletDto | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.walletService.getMyWallet().subscribe({
      next: (w) => { this.wallet = w; this.loading = false; },
      error: () => { this.error = 'Failed to load wallet.'; this.loading = false; }
    });
  }
}