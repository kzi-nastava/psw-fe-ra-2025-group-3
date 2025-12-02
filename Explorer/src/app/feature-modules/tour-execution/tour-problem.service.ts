import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/env/environment';
import { TourProblem, TourProblemCreateDto, TourProblemUpdateDto, Message, AddMessageDto, MarkProblemResolvedDto } from './model/tour-problem.model';

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

  createProblem(problem: TourProblemCreateDto): Observable<TourProblem> {
    return this.http.post<TourProblem>(this.baseUrl, problem);
  }

  updateProblem(id: number, problem: TourProblemUpdateDto): Observable<TourProblem> {
    return this.http.put<TourProblem>(`${this.baseUrl}/${id}`, problem);
  }

  deleteProblem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Nova metoda za slanje poruka (turista)
  addMessage(problemId: number, dto: AddMessageDto): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/${problemId}/messages`, dto);
  }

  // Nova metoda za označavanje kao resolved
  markResolved(problemId: number, dto: MarkProblemResolvedDto): Observable<TourProblem> {
    return this.http.put<TourProblem>(`${this.baseUrl}/${problemId}/mark-resolved`, dto);
  }

  // Nova metoda za označavanje kao unresolved
  markUnresolved(problemId: number, dto: MarkProblemResolvedDto): Observable<TourProblem> {
    return this.http.put<TourProblem>(`${this.baseUrl}/${problemId}/mark-unresolved`, dto);
  }

  checkTourExists(tourId: number): Observable<boolean> {
    console.log('Checking if tour exists:', tourId);
    
    return this.http.get<{exists: boolean}>(`${this.baseUrl}/validate-tour/${tourId}`).pipe(
      map(response => {
        console.log('Tour validation response:', response);
        return response.exists;
      }),
      catchError((error) => {
        console.log('Tour validation error:', error);
        return of(false);
      })
    );
  }
}