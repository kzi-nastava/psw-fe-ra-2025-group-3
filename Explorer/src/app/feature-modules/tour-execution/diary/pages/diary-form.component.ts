import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DiaryService } from '../diary.service';

@Component({
  selector: 'xp-diary-form',
  templateUrl: './diary-form.component.html',
  styleUrls: ['./diary-form.component.css']
})
export class DiaryFormComponent implements OnInit {

  form: FormGroup;
  diaryId?: number;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private diaryService: DiaryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      country: ['', Validators.required],
      city: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.diaryId = +id;
      this.isEdit = true;

      this.diaryService.getMyDiaries().subscribe(diaries => {
        const diary = diaries.find(d => d.id === this.diaryId);
        if (diary) {
          this.form.patchValue({
            title: diary.title,
            country: diary.country,
            city: diary.city
          });
        }
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) return;

    const action = this.isEdit && this.diaryId
      ? this.diaryService.updateDiary(this.diaryId, this.form.value)
      : this.diaryService.createDiary(this.form.value);

    action.subscribe({
      next: () => this.router.navigate(['/tourist/diaries']),
      error: err => {
        console.error(err);
        alert('Diary could not be saved');
      }
    });
  }
}
