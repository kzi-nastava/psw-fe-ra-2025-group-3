import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { AccountDto, AccountCreateDto } from './model/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private baseUrl = environment.apiHost + 'administration/accounts';

  constructor(private http: HttpClient) { }

  // CREATE – POST /api/administration/accounts
  createAccount(account: AccountCreateDto): Observable<AccountDto> {
    return this.http.post<AccountDto>(this.baseUrl, account);
  }

  // UPDATE – PUT /api/administration/accounts/{id}
updateAccount(account: AccountDto & { password?: string }): Observable<AccountDto> {
  return this.http.put<AccountDto>(`${this.baseUrl}/${account.id}`, account);
}


  // GET ALL – GET /api/administration/accounts
  getAllAccounts(): Observable<AccountDto[]> {
    return this.http.get<AccountDto[]>(this.baseUrl);
  }

  // GET BY ID – GET /api/administration/accounts/{id}
  getAccountById(id: number): Observable<AccountDto> {
    return this.http.get<AccountDto>(`${this.baseUrl}/${id}`);
  }

  // BLOCK – PUT /api/administration/accounts/{id}/block
  blockAccount(id: number): Observable<AccountDto> {
    return this.http.put<AccountDto>(`${this.baseUrl}/${id}/block`, {});
  }

  // UNBLOCK – PUT /api/administration/accounts/{id}/unblock
  unblockAccount(id: number): Observable<AccountDto> {
    return this.http.put<AccountDto>(`${this.baseUrl}/${id}/unblock`, {});
  }
}
