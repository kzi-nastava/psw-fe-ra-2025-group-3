import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/env/environment';
import { TourProblem, TourProblemCreateDto, TourProblemUpdateDto, Message, AddMessageDto, MarkProblemResolvedDto, AdminDeadlineDto } from './model/tour-problem.model';

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

  // Admin methods
  getAllProblems(): Observable<TourProblem[]> {
    return this.http.get<TourProblem[]>(`${environment.apiHost}admin/tour-problems`);
  }

  getProblemByIdForAdmin(id: number): Observable<TourProblem> {
    return this.http.get<TourProblem>(`${environment.apiHost}admin/tour-problems/${id}`);
  }

  getOverdueProblems(): Observable<TourProblem[]> {
    return this.http.get<TourProblem[]>(`${environment.apiHost}admin/tour-problems/overdue`);
  }
  
  // Metoda za postavljanje roka
  setDeadline(problemId: number, dto: AdminDeadlineDto): Observable<void> {
    return this.http.post<void>(
      environment.apiHost + 'admin/tour-problems/' + problemId + '/deadline',
      dto
    );
  }

  // Metoda za zatvaranje problema
  closeProblem(problemId: number): Observable<void> {
    return this.http.post<void>(
      environment.apiHost + 'admin/tour-problems/' + problemId + '/close',
      {}
    );
  }

  // Metoda za penalizaciju autora
  penalizeAuthor(problemId: number): Observable<void> {
    return this.http.post<void>(
      environment.apiHost + 'admin/tour-problems/' + problemId + '/penalize',
      {}
    );
  }
}