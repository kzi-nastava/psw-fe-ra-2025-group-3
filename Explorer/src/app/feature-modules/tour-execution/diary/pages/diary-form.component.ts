import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DiaryService } from '../diary.service';
import { DiaryCreate } from '../../model/diary-create.model';

@Component({
  selector: 'app-diary-form',
  templateUrl: './diary-form.component.html'
})
export class DiaryFormComponent implements OnInit {

  form!: FormGroup;
  diaryId?: number;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private service: DiaryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      country: ['', Validators.required],
      city: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.diaryId = +id;
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    const dto: DiaryCreate = this.form.value;

    if (this.isEdit && this.diaryId) {
      this.service.update(this.diaryId, dto)
        .subscribe(() => this.router.navigate(['my-diaries']));
    } else {
      this.service.create(dto)
        .subscribe(() => this.router.navigate(['my-diaries']));
    }
  }
}
