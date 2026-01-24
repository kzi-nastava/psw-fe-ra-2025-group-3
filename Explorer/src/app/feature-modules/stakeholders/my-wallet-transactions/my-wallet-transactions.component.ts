import { Component, OnInit } from '@angular/core';
import { WalletService } from '../wallet.service';
import { WalletTransactionDto, PagedResultDto } from '../model/wallet-transaction.model';

enum WalletTransactionType {
  AdminTopUp = 1,
  CheckoutPurchase = 2,
  WelcomeBonusAc = 3,
  RankRewardAc = 4
}

type TxFilter = 'all' | 'credit' | 'debit';

@Component({
  selector: 'xp-my-wallet-transactions',
  templateUrl: './my-wallet-transactions.component.html',
  styleUrls: ['./my-wallet-transactions.component.css']
})
export class MyWalletTransactionsComponent implements OnInit {
  loading = true;
  error: string | null = null;

  transactions: WalletTransactionDto[] = [];
  page = 1;
  pageSize = 10;
  totalCount = 0;

  filter: TxFilter = 'all';

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.load();
  }

  get maxPage(): number {
    return this.totalCount === 0 ? 1 : Math.ceil(this.totalCount / this.pageSize);
  }

  get creditsCount(): number {
    return this.transactions.filter(t => this.isCredit(t.amountAc)).length;
  }

  get debitsCount(): number {
    return this.transactions.filter(t => !this.isCredit(t.amountAc)).length;
  }

  get displayedTransactions(): WalletTransactionDto[] {
    if (this.filter === 'credit') return this.transactions.filter(t => this.isCredit(t.amountAc));
    if (this.filter === 'debit') return this.transactions.filter(t => !this.isCredit(t.amountAc));
    return this.transactions;
  }

  setFilter(f: TxFilter): void {
    this.filter = f;
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.walletService.getMyTransactions(this.page, this.pageSize).subscribe({
      next: (res: PagedResultDto<WalletTransactionDto>) => {
        this.transactions = res.items ?? [];
        this.totalCount = res.totalCount ?? 0;

        if (this.page > this.maxPage) {
          this.page = this.maxPage;
          this.load();
          return;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error while loading wallet transactions', err);
        this.transactions = [];
        this.totalCount = 0;
        this.error = 'Failed to load transactions.';
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.page < this.maxPage) {
      this.page++;
      this.load();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }

  isCredit(amount: number): boolean {
    return (amount ?? 0) > 0;
  }

  absAmount(amount: number): number {
    return Math.abs(amount ?? 0);
  }

  typeLabel(type: number): string {
    switch (type) {
      case WalletTransactionType.AdminTopUp: return 'Admin top-up';
      case WalletTransactionType.CheckoutPurchase: return 'Checkout purchase';
      case WalletTransactionType.WelcomeBonusAc: return 'Welcome bonus';
      case WalletTransactionType.RankRewardAc: return 'Rank reward';
      default: return 'Wallet transaction';
    }
  }

  formatDescription(tx: WalletTransactionDto): string {
    switch (tx.type) {
      case WalletTransactionType.AdminTopUp:
        return 'Coins were added to your wallet by an administrator.';

      case WalletTransactionType.CheckoutPurchase:
        return 'Coins were spent during checkout (tour and bundle purchase).';

      case WalletTransactionType.WelcomeBonusAc:
        return 'You received a one-time welcome bonus (wheel of fortune).';

      case WalletTransactionType.RankRewardAc:
        return 'You earned AC as a reward for reaching a new rank.';
    }

    // fallback: clean the raw text if something unexpected comes
    const raw = (tx.description ?? '').toString();
    const noParens = raw.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const noAmount = noParens.replace(/[:\-]?\s*[+\-]?\d+\s*AC\b/gi, '').trim();

    return noAmount || 'Wallet transaction recorded.';
  }
}