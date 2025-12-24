import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Preference, PreferenceCreateDto, PreferenceUpdateDto } from './model/preference.model';
import { RecommendedTour } from './model/recommended-tour.model'; // 
@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  private baseUrl = environment.apiHost + 'tourist/preferences';

  constructor(private http: HttpClient) { }

  getMyPreferences(): Observable<Preference> {
    return this.http.get<Preference>(this.baseUrl);
  }

  createPreference(preference: PreferenceCreateDto): Observable<Preference> {
    return this.http.post<Preference>(this.baseUrl, preference);
  }

  updatePreference(preference: PreferenceUpdateDto): Observable<Preference> {
    return this.http.put<Preference>(this.baseUrl, preference);
  }

  deletePreference(): Observable<void> {
    return this.http.delete<void>(this.baseUrl);
  }

   //
  getRecommendedTours(): Observable<RecommendedTour[]> {
    return this.http.get<RecommendedTour[]>(`${this.baseUrl}/recommended-tours`);
  }
}