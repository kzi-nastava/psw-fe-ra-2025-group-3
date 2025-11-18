import { Component, OnInit } from '@angular/core';
import { TourProblemService } from '../tour-problem.service';
import { TourProblem, ProblemCategory, ProblemPriority } from '../model/tour-problem.model';

@Component({
  selector: 'app-tour-problem-list',
  templateUrl: './tour-problem-list.component.html',
  styleUrls: ['./tour-problem-list.component.css']
})
export class TourProblemListComponent implements OnInit {
  problems: TourProblem[] = [];
  displayedColumns: string[] = ['id', 'tourId', 'category', 'priority', 'description', 'time', 'actions'];

  constructor(private tourProblemService: TourProblemService) { }

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.tourProblemService.getMyProblems().subscribe({
      next: (data) => {
        this.problems = data;
      },
      error: (err) => {
        console.error('Error loading problems:', err);
      }
    });
  }

  getCategoryName(category: ProblemCategory): string {
    return ProblemCategory[category];
  }

  getPriorityName(priority: ProblemPriority): string {
    return ProblemPriority[priority];
  }

  getPriorityColor(priority: ProblemPriority): string {
    switch (priority) {
      case ProblemPriority.Low: return 'green';
      case ProblemPriority.Medium: return 'orange';
      case ProblemPriority.High: return 'red';
      case ProblemPriority.Critical: return 'darkred';
      default: return 'black';
    }
  }

  onEdit(problem: TourProblem): void {
    console.log('Edit problem:', problem);
    // TODO: Navigate to edit form
  }

  onDelete(id: number): void {
    if (confirm('Da li ste sigurni da želite da obrišete ovu prijavu? Ova akcija se ne može poništiti.')) {
      this.tourProblemService.deleteProblem(id).subscribe({
        next: () => {
          this.loadProblems();
          alert('Problem uspešno obrisan!');
        },
        error: (err) => {
          console.error('Error deleting problem:', err);
          alert('Greška pri brisanju problema!');
        }
      });
    }
  }
}