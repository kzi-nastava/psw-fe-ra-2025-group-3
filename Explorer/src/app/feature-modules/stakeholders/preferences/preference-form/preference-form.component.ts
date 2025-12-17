import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PreferenceService } from '../../preference.service'; // Ispravi path
import { Preference, PreferenceCreateDto, PreferenceUpdateDto, TourDifficulty, AVAILABLE_TAGS } from '../../model/preference.model';

@Component({
  selector: 'xp-preference-form',
  templateUrl: './preference-form.component.html',
  styleUrls: ['./preference-form.component.css']
})
export class PreferenceFormComponent implements OnInit {
  @Input() preference: Preference | null = null;
  @Input() shouldEdit: boolean = false;
  @Output() preferenceUpdated = new EventEmitter<void>();

  preferenceForm: FormGroup;
  availableTags = AVAILABLE_TAGS;
  selectedTags: string[] = [];
  
  difficulties = [
    { value: TourDifficulty.Easy, label: 'Lako', icon: 'sentiment_satisfied' },
    { value: TourDifficulty.Medium, label: 'Srednje', icon: 'sentiment_neutral' },
    { value: TourDifficulty.Hard, label: 'Teško', icon: 'fitness_center' }
  ];

  constructor(private service: PreferenceService) {
    this.preferenceForm = new FormGroup({
      difficulty: new FormControl(TourDifficulty.Medium, [Validators.required]),
      walkingRating: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(3)]),
      bicycleRating: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(3)]),
      carRating: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(3)]),
      boatRating: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(3)])
    });
  }

  ngOnInit(): void {
    if (this.shouldEdit && this.preference) {
      this.preferenceForm.patchValue({
        difficulty: this.preference.difficulty,
        walkingRating: this.preference.walkingRating,
        bicycleRating: this.preference.bicycleRating,
        carRating: this.preference.carRating,
        boatRating: this.preference.boatRating
      });
      this.selectedTags = [...this.preference.tags];
    }
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  getRatingArray(max: number): number[] {
    return Array.from({ length: max + 1 }, (_, i) => i);
  }

  onSubmit(): void {
    if (this.preferenceForm.invalid || this.selectedTags.length === 0) {
      alert('Molimo popunite sva polja i odaberite najmanje jedan tag.');
      return;
    }

    const formValue = this.preferenceForm.value;

    if (this.shouldEdit && this.preference) {
      const updateDto: PreferenceUpdateDto = {
        id: this.preference.id,
        difficulty: formValue.difficulty,
        walkingRating: formValue.walkingRating,
        bicycleRating: formValue.bicycleRating,
        carRating: formValue.carRating,
        boatRating: formValue.boatRating,
        tags: this.selectedTags
      };

      this.service.updatePreference(updateDto).subscribe({
        next: () => {
          this.preferenceUpdated.emit();
        },
        error: (err: any) => {
          alert('Greška pri izmeni preferenci: ' + err.message);
        }
      });
    } else {
      const createDto: PreferenceCreateDto = {
        difficulty: formValue.difficulty,
        walkingRating: formValue.walkingRating,
        bicycleRating: formValue.bicycleRating,
        carRating: formValue.carRating,
        boatRating: formValue.boatRating,
        tags: this.selectedTags
      };

      this.service.createPreference(createDto).subscribe({
        next: () => {
          this.preferenceUpdated.emit();
        },
        error: (err: any) => {
          alert('Greška pri kreiranju preferenci: ' + err.message);
        }
      });
    }
  }

  onCancel(): void {
    this.preferenceUpdated.emit();
  }
}