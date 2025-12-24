import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { TourProblem, Message, AddMessageDto } from '../tour-execution/model/tour-problem.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorProblemService {
  private baseUrl = environment.apiHost + 'author/tour-problems';

  constructor(private http: HttpClient) { }

  // GET svi problemi sa tura autora
  getMyToursProblems(): Observable<TourProblem[]> {
    return this.http.get<TourProblem[]>(`${this.baseUrl}/my-tours`);
  }

  // GET problemi sa specifične ture
  getTourProblems(tourId: number): Observable<TourProblem[]> {
    return this.http.get<TourProblem[]>(`${this.baseUrl}/my-tours`);
  }

  // GET detalji problema
  getProblemById(id: number): Observable<TourProblem> {
    return this.http.get<TourProblem>(`${this.baseUrl}/${id}`);
  }

  // POST nova poruka (autor)
  addMessage(problemId: number, dto: AddMessageDto): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/${problemId}/messages`, dto);
  }
}
