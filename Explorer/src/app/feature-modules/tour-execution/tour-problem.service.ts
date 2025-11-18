import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { TourProblem } from './model/tour-problem.model';

@Injectable({
  providedIn: 'root'
})
export class TourProblemService {
  private baseUrl = environment.apiHost + 'tour-problems';

  constructor(private http: HttpClient) { }

  getMyProblems(): Observable<TourProblem[]> {
    return this.http.get<TourProblem[]>(`${this.baseUrl}/my`);
  }

  getProblemById(id: number): Observable<TourProblem> {
    return this.http.get<TourProblem>(`${this.baseUrl}/${id}`);
  }

  createProblem(problem: TourProblem): Observable<TourProblem> {
    return this.http.post<TourProblem>(this.baseUrl, problem);
  }

  updateProblem(id: number, problem: TourProblem): Observable<TourProblem> {
    return this.http.put<TourProblem>(`${this.baseUrl}/${id}`, problem);
  }

  deleteProblem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}