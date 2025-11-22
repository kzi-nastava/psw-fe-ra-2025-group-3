import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ClubCreateDto, ClubDto, ClubUpdateDto } from './model/club.model';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private readonly baseUrl = environment.apiHost + 'clubs';
  private readonly imagesUrl = environment.apiHost.replace(/\/api\/?$/, '') + '/api/images';

  constructor(private http: HttpClient) {}

  getClubs(page: number, pageSize: number): Observable<PagedResults<ClubDto>> {
    return this.http.get<PagedResults<ClubDto>>(`${this.baseUrl}?page=${page}&pageSize=${pageSize}`);
  }

  getMyClubs(page: number, pageSize: number): Observable<PagedResults<ClubDto>> {
    return this.http.get<PagedResults<ClubDto>>(`${this.baseUrl}/my-clubs?page=${page}&pageSize=${pageSize}`);
  }

  getClub(id: number): Observable<ClubDto> {
    return this.http.get<ClubDto>(`${this.baseUrl}/${id}`);
  }

  createClub(dto: ClubCreateDto): Observable<ClubDto> {
    return this.http.post<ClubDto>(this.baseUrl, dto);
  }

  updateClub(id: number, dto: ClubUpdateDto): Observable<ClubDto> {
    return this.http.put<ClubDto>(`${this.baseUrl}/${id}` , dto);
  }

  deleteClub(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadFeaturedImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('files', file);
    return this.http.post(this.imagesUrl + '/upload-single/club', formData, { responseType: 'text' });
  }

  uploadGalleryImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post<string[]>(this.imagesUrl + '/upload-multiple/club', formData);
  }

  buildImageUrl(relativeUrl: string): string {
    const apiRoot = environment.apiHost.replace(/\/api\/?$/, '');
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return apiRoot + relativeUrl;
  }
}
