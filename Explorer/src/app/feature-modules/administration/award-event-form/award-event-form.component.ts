import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output } from '@angular/core'; 
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministrationService } from '../administration.service';
import { AwardEvent, AwardEventStatus } from '../model/award-event.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'; 

@Component({
  selector: 'xp-award-event-form',
  templateUrl: './award-event-form.component.html',
  styleUrls: ['./award-event-form.component.css']
})
export class AwardEventFormComponent implements OnInit { 

  @Output() awardEventUpdated = new EventEmitter<null>();

  awardEvent: AwardEvent;
  shouldEdit: boolean = false;

  awardEventForm = new FormGroup({
    id: new FormControl(-1),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]),
    votingStartDate: new FormControl(new Date(), [Validators.required]),
    votingEndDate: new FormControl(new Date(), [Validators.required]),
    votingStartTime: new FormControl('00:00', [Validators.required]), 
    votingEndTime: new FormControl('00:00', [Validators.required])
  });

  constructor(
    private service: AdministrationService,
    public dialogRef: MatDialogRef<AwardEventFormComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) { 
    this.awardEvent = data.awardEvent;
    this.shouldEdit = data.shouldEdit;
  }

  private combineDateTime(date: Date, timeStr: string): Date {
      const parts = timeStr.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      
      const combinedDate = new Date(date);     
      combinedDate.setHours(hours, minutes, 0, 0); 
      return combinedDate;
  }

  ngOnInit(): void {
    if (this.shouldEdit && this.awardEvent) {
      const startDateTime = new Date(this.awardEvent.votingStartDate);
      const endDateTime = new Date(this.awardEvent.votingEndDate);

      this.awardEventForm.patchValue({
        id: this.awardEvent.id,
        name: this.awardEvent.name,
        description: this.awardEvent.description,
        year: this.awardEvent.year,
        votingStartDate: startDateTime,
        votingEndDate: endDateTime,
        votingStartTime: `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`,
        votingEndTime: `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`,
      });
    }
  }

  addAwardEvent(): void {

    const formStartDate: Date = this.awardEventForm.value.votingStartDate!;
    const formEndDate: Date = this.awardEventForm.value.votingEndDate!;
    const formStartTime: string = this.awardEventForm.value.votingStartTime!;
    const formEndTime: string = this.awardEventForm.value.votingEndTime!;

    const finalStartDate = this.combineDateTime(formStartDate, formStartTime);
    const finalEndDate = this.combineDateTime(formEndDate, formEndTime);

    const awardEvent: AwardEvent = {
      name: this.awardEventForm.value.name || '',
      description: this.awardEventForm.value.description || '',
      year: this.awardEventForm.value.year || 0,
      status: this.shouldEdit && this.awardEvent ? this.awardEvent.status : AwardEventStatus.Draft,
      votingStartDate: finalStartDate, 
      votingEndDate: finalEndDate,
    };

    if (this.shouldEdit) {
      awardEvent.id = this.awardEvent.id;
      this.service.updateAwardEvent(awardEvent).subscribe({
        next: () => {
          this.dialogRef.close(true); 
        },
        error: (error) => {
          console.error('Greška pri izmeni dodele:', error);
          alert('Došlo je do greške pri izmeni. Proverite konzolu.');
        }
      });
    } else {
      this.service.addAwardEvent(awardEvent).subscribe({
        next: () => {
          this.dialogRef.close(true); 
        },
        error: (error) => {
          console.error('Greška pri kreiranju dodele:', error);
          alert('Došlo je do greške pri kreiranju. Proverite konzolu i unete podatke (npr. godina mora biti jedinstvena).');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false); 
  }
}