import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../administration.service';
import { AwardEvent } from '../model/award-event.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MatDialog } from '@angular/material/dialog';
import { AwardEventFormComponent } from '../award-event-form/award-event-form.component';

@Component({
  selector: 'xp-award-events',
  templateUrl: './award-events.component.html',
  styleUrls: ['./award-events.component.css']
})
export class AwardEventsComponent implements OnInit {

  awardEvents: AwardEvent[] = [];
  selectedAwardEvent: AwardEvent | null = null;
  shouldRenderAwardEventForm: boolean = false;
  shouldEdit: boolean = false;
  
  constructor(private service: AdministrationService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getAwardEvents();
  }
  
  deleteAwardEvent(id: number | undefined): void {
    if (id !== undefined) {
      const isConfirmed = window.confirm('Are you sure you want to delete this award event?');

      if (isConfirmed) {
        this.service.deleteAwardEvent(id).subscribe({
          next: () => {
            this.getAwardEvents();
          },
          error: (err) => {
            console.error('Error deleting award event:', err);
          }
        });
      }
    }
  }

  getAwardEvents(): void {
    this.service.getAwardEvents().subscribe({
      next: (result: PagedResults<AwardEvent>) => {
        this.awardEvents = result.results;
      },
      error: () => {
      }
    });
  }

  openFormDialog(awardEvent?: AwardEvent): void {
    const dialogRef = this.dialog.open(AwardEventFormComponent, {
      width: '600px',
      data: {
        awardEvent: awardEvent, 
        shouldEdit: !!awardEvent 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAwardEvents();
      }
    });
  }

  onEditClicked(awardEvent: AwardEvent): void {
    this.openFormDialog(awardEvent);
  }

  onAddClicked(): void {
    this.openFormDialog();
  }
}