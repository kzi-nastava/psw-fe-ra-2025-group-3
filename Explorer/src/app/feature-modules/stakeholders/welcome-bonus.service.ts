import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { WelcomeBonus } from './model/welcome-bonus.model';

@Injectable({
  providedIn: 'root'
})
export class WelcomeBonusService {
  private readonly baseUrl = environment.apiHost + 'tourist/welcome-bonus';

  constructor(private http: HttpClient) { }

  getWelcomeBonus(): Observable<WelcomeBonus> {
    return this.http.get<WelcomeBonus>(this.baseUrl);
  }
}
