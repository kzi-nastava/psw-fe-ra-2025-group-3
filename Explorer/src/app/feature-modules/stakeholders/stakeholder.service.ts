import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Person } from './model/person.model';
import { environment } from 'src/env/environment';
import { AccountRegistrationDto } from './model/account-registration.dto';
import { WalletDto, WalletTopUpDto } from './model/wallet.model';
import { AuthorProfileStatsDto } from './model/author-profile-stats.model';
import { TouristStats } from './model/tourist-stats.model';
import { AuthorTopListItemDto } from './model/author-top-list-item.model';



@Injectable({
  providedIn: 'root'
})
export class StakeholderService {

  private touristStatsUpdated$ = new Subject<void>();
  public touristStatsUpdated = this.touristStatsUpdated$.asObservable();

  private readonly profileUrl = environment.apiHost + 'stakeholders/person';
  private readonly authorStatsUrl = environment.apiHost + 'authors/me/profile-stats';
  private readonly baseUrl = environment.apiHost + 'stakeholders/person';
  private readonly touristStatsUrl = environment.apiHost + 'stakeholders/person/tourist-stats';
  private readonly authorsTopUrl = environment.apiHost + 'authors/top';
private readonly authorByIdStatsUrl = environment.apiHost + 'authors'; 

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
  
getMyAuthorProfileStats(): Observable<AuthorProfileStatsDto> {
  return this.http.get<AuthorProfileStatsDto>(this.authorStatsUrl);
}

getTouristStats(): Observable<TouristStats> {
  return this.http.get<TouristStats>(this.touristStatsUrl);
}

getTouristStatsByUserId(userId: number): Observable<TouristStats> {
  return this.http.get<TouristStats>(`${environment.apiHost}stakeholders/person/tourist-stats/${userId}`);
}

claimRankRewards(): Observable<any> {
  return this.http.post<any>(environment.apiHost + 'tourist/rank-rewards/claim', {});
}

notifyTouristStatsUpdated(): void {
  this.touristStatsUpdated$.next();
}
getTopAuthors(sort: string = 'rating', take: number = 20): Observable<AuthorTopListItemDto[]> {
  return this.http.get<AuthorTopListItemDto[]>(`${this.authorsTopUrl}?sort=${sort}&take=${take}`);
}

getAuthorProfileStats(authorId: number): Observable<AuthorProfileStatsDto> {
  return this.http.get<AuthorProfileStatsDto>(`${this.authorByIdStatsUrl}/${authorId}/profile-stats`);
}

}