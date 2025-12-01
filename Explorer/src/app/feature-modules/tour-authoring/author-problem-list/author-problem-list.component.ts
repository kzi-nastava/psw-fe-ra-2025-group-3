import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorProblemService } from '../author-problem.service';
import { TourProblem, ProblemCategory, ProblemPriority, ProblemStatus } from '../../tour-execution/model/tour-problem.model';

@Component({
  selector: 'app-author-problem-list',
  templateUrl: './author-problem-list.component.html',
  styleUrls: ['./author-problem-list.component.css']
})
export class AuthorProblemListComponent implements OnInit {
  problems: TourProblem[] = [];
  loading: boolean = true;

  constructor(
    private authorProblemService: AuthorProblemService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.loading = true;
    this.authorProblemService.getMyToursProblems().subscribe({
      next: (data) => {
        this.problems = data.map(problem => ({
          ...problem,
          messages: problem.messages || []
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading problems:', err);
        alert('Error loading problems from your tours!');
        this.loading = false;
      }
    });
  }

  getCategoryName(category: ProblemCategory): string {
    return ProblemCategory[category];
  }

  getPriorityName(priority: ProblemPriority): string {
    return ProblemPriority[priority];
  }

  getStatusName(status: ProblemStatus): string {
    return ProblemStatus[status];
  }

  getPriorityColor(priority: ProblemPriority): string {
    switch (priority) {
      case ProblemPriority.Low: return '#4caf50';
      case ProblemPriority.Medium: return '#ff9800';
      case ProblemPriority.High: return '#f44336';
      case ProblemPriority.Critical: return '#d32f2f';
      default: return '#9e9e9e';
    }
  }

  getStatusColor(status: ProblemStatus): string {
    switch (status) {
      case ProblemStatus.Open: return '#2196f3';
      case ProblemStatus.Resolved: return '#4caf50';
      case ProblemStatus.Unresolved: return '#f44336';
      default: return '#9e9e9e';
    }
  }

  onViewDetails(problemId: number): void {
    this.router.navigate(['/author/tour-problems', problemId]);
  }
}
