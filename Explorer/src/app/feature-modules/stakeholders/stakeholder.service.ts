import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from './model/person.model';
import { environment } from 'src/env/environment';
import { AccountRegistrationDto } from './model/account-registration.dto';
import { WalletDto, WalletTopUpDto } from './model/wallet.model';


@Injectable({
  providedIn: 'root'
})
export class StakeholderService {


  private readonly profileUrl = environment.apiHost + 'stakeholders/person';
  
  private readonly baseUrl = environment.apiHost + 'stakeholders/person';

  constructor(private http: HttpClient) {}

  // GET PROFILE
  getProfile(): Observable<Person> {
    return this.http.get<Person>(this.profileUrl);
  }

  // UPDATE PROFILE
  updateProfile(profile: Person): Observable<Person> {
    return this.http.put<Person>(this.profileUrl, profile);
  }



  // GET ALL

  getAllPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/all`);
  }

  // GET ALL TOURISTS
  getAllTourists(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/tourists`);
  }

  // GET BY ID
  getPersonById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/${id}`);
  }

  // GET BY USER ID
  getPersonByUserId(userId: number): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/user/${userId}`);
  }

  // CREATE
  createPerson(dto: AccountRegistrationDto): Observable<Person> {
    return this.http.post<Person>(this.baseUrl, dto);
  }

  // BLOCK
  blockPerson(id: number): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/${id}/block`, {});
  }

  // UNBLOCK
  unblockPerson(id: number): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/${id}/unblock`, {});
  }

  private readonly adminWalletUrl = environment.apiHost + 'administrator/wallet';

  topUpWallet(dto: { touristUserId: number; amountAc: number }) {
    return this.http.post<any>(`${this.adminWalletUrl}/topup`, dto);
  }

}