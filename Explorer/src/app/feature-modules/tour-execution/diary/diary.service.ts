import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diary } from '../model/diary.model';
import { DiaryCreate } from '../model/diary-create.model';

@Injectable({ providedIn: 'root' })
export class DiaryService {

  // BITNO: koristi puni backend URL (kao u Swaggeru)
  private readonly apiUrl = 'https://localhost:44333/api/diaries';

  constructor(private http: HttpClient) {}

  getMyDiaries(): Observable<Diary[]> {
    return this.http.get<Diary[]>(this.apiUrl);
  }

  createDiary(dto: DiaryCreate): Observable<Diary> {
    return this.http.post<Diary>(this.apiUrl, dto);
  }

  deleteDiary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateDiary(id: number, dto: DiaryCreate) {
  return this.http.put(`${this.apiUrl}/${id}`, dto);
}
}
