import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DiaryService } from '../../diary.service';
import { Diary } from '../../../model/diary.model';

@Component({
  selector: 'app-diary-list',
  templateUrl: './diary-list.component.html'
})
export class DiaryListComponent implements OnInit {

  diaries: Diary[] = [];

  constructor(
    private diaryService: DiaryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.diaryService.getMyDiaries()
      .subscribe(d => this.diaries = d);
  }

  create(): void {
    this.router.navigate(['my-diaries/new']);
  }

  edit(id: number): void {
    this.router.navigate(['my-diaries/edit', id]);
  }

  archive(id: number): void {
    this.diaryService.archive(id).subscribe(() => this.load());
  }

  delete(id: number): void {
    if (confirm('Delete diary?')) {
      this.diaryService.delete(id).subscribe(() => this.load());
    }
  }
}
