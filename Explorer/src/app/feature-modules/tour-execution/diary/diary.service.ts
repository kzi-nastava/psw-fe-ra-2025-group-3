import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diary } from '../model/diary.model';
import { DiaryCreate } from '../model/diary-create.model';

@Injectable({
  providedIn: 'root'
})
export class DiaryService {

  private readonly apiUrl = '/api/diaries';

  constructor(private http: HttpClient) {}

  getMyDiaries(): Observable<Diary[]> {
    return this.http.get<Diary[]>(this.apiUrl);
  }

  create(dto: DiaryCreate): Observable<Diary> {
    return this.http.post<Diary>(this.apiUrl, dto);
  }

  update(id: number, dto: DiaryCreate): Observable<Diary> {
    return this.http.put<Diary>(`${this.apiUrl}/${id}`, dto);
  }

  archive(id: number): Observable<Diary> {
    return this.http.post<Diary>(`${this.apiUrl}/${id}/archive`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
