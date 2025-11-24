import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministrationService } from '../administration.service';
import { Monument } from '../model/monument.model';

@Component({
  selector: 'xp-monument-form',
  templateUrl: './monument-form.component.html',
  styleUrls: ['./monument-form.component.css']
})
export class MonumentFormComponent implements OnChanges {

  @Input() monument: Monument | null = null;
  @Input() shouldEdit: boolean = false;
  @Output() monumentUpdated = new EventEmitter<void>();

  constructor(private service: AdministrationService) { }

  monumentForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    year: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    latitude: new FormControl<number | null>(null, [Validators.required]),
    longitude: new FormControl<number | null>(null, [Validators.required]),
  });

  ngOnChanges(): void {
    this.monumentForm.reset();   
    if (this.shouldEdit && this.monument) {
      this.monumentForm.patchValue({
        name: this.monument.name,
        description: this.monument.description,
        year: this.monument.year,
        latitude: this.monument.latitude,
        longitude: this.monument.longitude
      });
    }
  }

  addMonument(): void {
    if (this.monumentForm.invalid) return;

    const monument: Monument = {
      name: this.monumentForm.value.name || '',
      description: this.monumentForm.value.description || '',
      year: this.monumentForm.value.year ?? 0,
      status: 'Active',
      latitude: this.monumentForm.value.latitude ?? 0,
      longitude: this.monumentForm.value.longitude ?? 0
    };

    this.service.addMonument(monument).subscribe({
      next: () => this.monumentUpdated.emit()
    });
  }

  updateMonument(): void {
    if (!this.monument || this.monumentForm.invalid) return;

    const monument: Monument = {
      id: this.monument.id,
      name: this.monumentForm.value.name || '',
      description: this.monumentForm.value.description || '',
      year: this.monumentForm.value.year ?? 0,
      status: this.monument.status,
      latitude: this.monumentForm.value.latitude ?? 0,
      longitude: this.monumentForm.value.longitude ?? 0
    };

    this.service.updateMonument(monument).subscribe({
      next: () => this.monumentUpdated.emit()
    });
  }
}
