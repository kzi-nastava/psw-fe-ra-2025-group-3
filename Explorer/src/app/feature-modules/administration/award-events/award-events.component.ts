import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../administration.service';
import { AwardEvent } from '../model/award-event.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

@Component({
  selector: 'xp-award-events',
  templateUrl: './award-events.component.html',
  styleUrls: ['./award-events.component.css']
})
export class AwardEventsComponent implements OnInit {

  awardEvents: AwardEvent[] = [];
  selectedAwardEvent: AwardEvent;
  shouldRenderAwardEventForm: boolean = false;
  shouldEdit: boolean = false;
  
  constructor(private service: AdministrationService) { }

  ngOnInit(): void {
    this.getAwardEvents();
  }
  
  deleteAwardEvent(id: number | undefined): void {
    if (id !== undefined) {
      this.service.deleteAwardEvent(id).subscribe({
        next: () => {
          this.getAwardEvents();
        },
      });
    }
  }

  getAwardEvents(): void {
    this.service.getAwardEvents().subscribe({
      next: (result: PagedResults<AwardEvent>) => {
        this.awardEvents = result.results;
      },
      error: () => {
        // Logika za prikaz greške ako server ne radi
      }
    });
  }

  onEditClicked(awardEvent: AwardEvent): void {
    this.selectedAwardEvent = awardEvent;
    this.shouldRenderAwardEventForm = true;
    this.shouldEdit = true;
  }

  onAddClicked(): void {
    this.shouldEdit = false;
    this.shouldRenderAwardEventForm = true;
  }
}