import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from './model/person.model';
import { environment } from 'src/env/environment';
import { User } from '../../infrastructure/auth/model/user.model';
import { AccountRegistrationDto } from './model/account-registration.dto';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {

  private readonly baseUrl = environment.apiHost + 'stakeholders/person';

  constructor(private http: HttpClient) {}

  
  getProfile(): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}`);
  }

  updateProfile(profile: Person): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}`, profile);
  }

   // GET ALL – vraća listu PersonDto
  getAllPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/all`);
  }

  // GET BY ID – vraća jedan PersonDto
  getPersonById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/${id}`);
  }

  // CREATE – kreira PersonDto
  createPerson(dto: AccountRegistrationDto): Observable<Person> {
  return this.http.post<Person>(this.baseUrl, dto);
}

  // BLOCK – vraća PersonDto
  blockPerson(id: number): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/${id}/block`, {});
  }

  // UNBLOCK – vraća PersonDto
  unblockPerson(id: number): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/${id}/unblock`, {});
  }
}
