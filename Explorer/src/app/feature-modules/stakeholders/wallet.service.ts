import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { WalletDto, WalletTopUpDto } from './model/wallet.model';
import { WalletTransactionDto, PagedResultDto } from './model/wallet-transaction.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private http: HttpClient) {}

  getMyWallet(): Observable<WalletDto> {
    return this.http.get<WalletDto>(`${environment.apiHost}tourist/wallet/my`);
  }

  topUp(dto: WalletTopUpDto): Observable<WalletDto> {
    return this.http.post<WalletDto>(`${environment.apiHost}administrator/wallet/topup`, dto);
  }

  getMyTransactions(page: number, pageSize: number): Observable<PagedResultDto<WalletTransactionDto>> {
    return this.http.get<PagedResultDto<WalletTransactionDto>>(
      `${environment.apiHost}tourist/wallet/transactions?page=${page}&pageSize=${pageSize}`
    );
  }
}