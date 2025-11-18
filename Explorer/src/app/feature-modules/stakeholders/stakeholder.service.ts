import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from './model/person.model';
import { environment } from 'src/env/environment';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {
  
  private readonly apiHost = environment.apiHost;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<Person> {
    return this.http.get<Person>(`${this.apiHost}stakeholders/person`);
  }

  updateProfile(profile: Person): Observable<Person> {
    return this.http.put<Person>(`${this.apiHost}stakeholders/person`, profile);
  }
}