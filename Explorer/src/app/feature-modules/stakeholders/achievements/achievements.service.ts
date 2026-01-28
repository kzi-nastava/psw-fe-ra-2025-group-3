import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AchievementDto {
  code: string;
  name: string;
  description: string;
  awardedAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class AchievementsService {
  constructor(private http: HttpClient) {}

  getForCurrentTourist(): Observable<AchievementDto[]> {
    return this.http.get<AchievementDto[]>('/api/tourist/achievements');
  }
}