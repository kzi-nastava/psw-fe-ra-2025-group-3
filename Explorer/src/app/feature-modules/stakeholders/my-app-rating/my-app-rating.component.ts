import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppRatingService } from '../app-rating.service';
import { AppRatingResponse } from '../model/app-rating.model';

@Component({
  selector: 'xp-my-app-rating',
  templateUrl: './my-app-rating.component.html',
  styleUrls: ['./my-app-rating.component.css']
})
export class MyAppRatingComponent implements OnInit {

  form: FormGroup;
  existingRating: AppRatingResponse | null = null;
  role!: 'author' | 'tourist';

  stars: number[] = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private appRatingService: AppRatingService
  ) {
    this.form = this.fb.group({
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.role = this.route.snapshot.data['role'];
    this.loadMyRating();
  }

  loadMyRating(): void {
    this.appRatingService.getMyRating(this.role).subscribe({
      next: (res) => {
        this.existingRating = res;
        if (res) {
          this.form.patchValue({
            rating: res.rating,
            comment: res.comment
          });
        }
      },
      error: (err) => {
        console.error('Error while loading my rating', err);
      }
    });
  }

  setRating(value: number): void {
    this.form.get('rating')?.setValue(value);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.value;

    const request$ = this.existingRating
      ? this.appRatingService.updateRating(this.role, dto)
      : this.appRatingService.createRating(this.role, dto);

    request$.subscribe({
      next: (res) => {
        this.existingRating = res;
      },
      error: (err) => {
        console.error('Error while saving rating', err);
      }
    });
  }

  onDelete(): void {
    if (!this.existingRating) return;

    this.appRatingService.deleteRating(this.role).subscribe({
      next: () => {
        this.existingRating = null;
        this.form.reset();
      },
      error: (err) => {
        console.error('Error while deleting rating', err);
      }
    });
  }
}