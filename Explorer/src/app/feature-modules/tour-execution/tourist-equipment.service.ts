import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { EquipmentWithOwnership } from './model/equipment-with-ownership.model';

@Injectable({
  providedIn: 'root'
})
export class TouristEquipmentService {

  constructor(private http: HttpClient) { }

  getAllEquipmentWithOwnership(): Observable<EquipmentWithOwnership[]> {
    return this.http.get<EquipmentWithOwnership[]>(
      environment.apiHost + 'tourist/equipment/all'
    );
  }

  getMyEquipment(): Observable<EquipmentWithOwnership[]> {
    return this.http.get<EquipmentWithOwnership[]>(
      environment.apiHost + 'tourist/equipment/my'
    );
  }

  addEquipment(equipmentId: number): Observable<EquipmentWithOwnership> {
    return this.http.post<EquipmentWithOwnership>(
      environment.apiHost + 'tourist/equipment',
      equipmentId
    );
  }

  deleteEquipment(equipmentId: number): Observable<void> {
    return this.http.delete<void>(
      environment.apiHost + 'tourist/equipment/' + equipmentId
    );
  }
}