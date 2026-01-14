import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Sale, SaleCreateDto, SaleUpdateDto } from './model/sale.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private baseUrl = environment.apiHost + 'sales';

  constructor(private http: HttpClient) { }

  getMySales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.baseUrl}/my`);
  }

  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }

  createSale(sale: SaleCreateDto): Observable<Sale> {
    return this.http.post<Sale>(this.baseUrl, sale);
  }

  updateSale(id: number, sale: SaleUpdateDto): Observable<Sale> {
    return this.http.put<Sale>(`${this.baseUrl}/${id}`, sale);
  }

  deleteSale(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
