import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Equipment } from './model/equipment.model';
import { Monument } from './model/monument.model'; 
import { environment } from 'src/env/environment';
import { Observable } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AwardEvent } from './model/award-event.model';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {

  constructor(private http: HttpClient) { }

  // ---------- EQUIPMENT ----------

  getEquipment(): Observable<PagedResults<Equipment>> {
    return this.http.get<PagedResults<Equipment>>(
      environment.apiHost + 'administration/equipment'
    );
  }

  deleteEquipment(id: number): Observable<Equipment> {
    return this.http.delete<Equipment>(
      environment.apiHost + 'administration/equipment/' + id
    );
  }

  addEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.post<Equipment>(
      environment.apiHost + 'administration/equipment',
      equipment
    );
  }

  updateEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.put<Equipment>(
      environment.apiHost + 'administration/equipment/' + equipment.id,
      equipment
    );
  }


  // ---------- MONUMENTS ----------

  getMonuments(): Observable<PagedResults<Monument>> {
  return this.http.get<PagedResults<Monument>>(
    environment.apiHost + 'administration/monument?page=1&pageSize=100'
  );
}

deleteMonument(id: number): Observable<Monument> {
  return this.http.delete<Monument>(
    environment.apiHost + 'administration/monument/' + id
  );
}

addMonument(monument: Monument): Observable<Monument> {
  return this.http.post<Monument>(
    environment.apiHost + 'administration/monument',
    monument
  );
}

updateMonument(monument: Monument): Observable<Monument> {
  return this.http.put<Monument>(
    environment.apiHost + 'administration/monument/' + monument.id,
    monument
  );
}

  getAwardEvents(): Observable<PagedResults<AwardEvent>> {
    return this.http.get<PagedResults<AwardEvent>>(environment.apiHost + 'administrator/award-event');
  }

  deleteAwardEvent(id: number): Observable<AwardEvent> {
    return this.http.delete<AwardEvent>(environment.apiHost + 'administrator/award-event/' + id);
  }

  addAwardEvent(awardEvent: AwardEvent): Observable<AwardEvent> {   
    return this.http.post<AwardEvent>(environment.apiHost + 'administrator/award-event', awardEvent);
  }

  updateAwardEvent(awardEvent: AwardEvent): Observable<AwardEvent> {
    return this.http.put<AwardEvent>(environment.apiHost + 'administrator/award-event/' + awardEvent.id, awardEvent);
  }


}
