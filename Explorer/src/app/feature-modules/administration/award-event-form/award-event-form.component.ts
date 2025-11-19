import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministrationService } from '../administration.service';
import { AwardEvent, AwardEventStatus } from '../model/award-event.model'; 

@Component({
  selector: 'xp-award-event-form',
  templateUrl: './award-event-form.component.html',
  styleUrls: ['./award-event-form.component.css']
})
export class AwardEventFormComponent implements OnInit, OnChanges {
  
  @Input() awardEvent: AwardEvent;
  @Input() shouldEdit: boolean = false;
  @Output() awardEventUpdated = new EventEmitter<null>();

  awardEventForm = new FormGroup({
    id: new FormControl(-1),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]),
    votingStartDate: new FormControl(new Date(), [Validators.required]),
    votingEndDate: new FormControl(new Date(), [Validators.required])
  });

  constructor(private service: AdministrationService) { }

  ngOnInit(): void {
    if (this.shouldEdit && this.awardEvent) {
      this.awardEventForm.patchValue(this.awardEvent);
    }
  }

  ngOnChanges(): void {
    if (this.shouldEdit && this.awardEvent) {
      this.awardEventForm.patchValue({
        id: this.awardEvent.id,
        name: this.awardEvent.name,
        description: this.awardEvent.description,
        year: this.awardEvent.year,
        votingStartDate: new Date(this.awardEvent.votingStartDate), 
        votingEndDate: new Date(this.awardEvent.votingEndDate),
      });
    }
  }

  addAwardEvent(): void {
    const awardEvent: AwardEvent = {
      name: this.awardEventForm.value.name || '',
      description: this.awardEventForm.value.description || '',
      year: this.awardEventForm.value.year || 0,
      status: this.shouldEdit ? this.awardEvent.status : AwardEventStatus.Draft,
      votingStartDate: this.awardEventForm.value.votingStartDate || new Date(),
      votingEndDate: this.awardEventForm.value.votingEndDate || new Date(),
    };

    if (this.shouldEdit) {
      // UPDATE
      awardEvent.id = this.awardEvent.id;
      this.service.updateAwardEvent(awardEvent).subscribe({
        next: () => {
          this.awardEventUpdated.emit();
        }
      });
    } else {
      // CREATE
      this.service.addAwardEvent(awardEvent).subscribe({
        next: () => {
          this.awardEventUpdated.emit();
        }
      });
    }
  }
}