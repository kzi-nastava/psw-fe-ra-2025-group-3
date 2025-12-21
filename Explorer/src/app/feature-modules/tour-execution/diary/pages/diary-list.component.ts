import { Component, OnInit } from '@angular/core';
import { DiaryService } from '../diary.service';
import { Diary } from '../../model/diary.model';

@Component({
  selector: 'xp-diary-list',
  templateUrl: './diary-list.component.html',
  styleUrls: ['./diary-list.component.css']
})
export class DiaryListComponent implements OnInit {

  diaries: Diary[] = [];
  loading = true;

  constructor(private diaryService: DiaryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.diaryService.getMyDiaries().subscribe({
      next: d => {
        this.diaries = d;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete diary?')) return;

    this.diaryService.deleteDiary(id).subscribe(() => {
      this.load();
    });
  }
}
