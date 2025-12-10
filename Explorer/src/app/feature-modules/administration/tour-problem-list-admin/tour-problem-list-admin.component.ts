import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TourProblemService } from '../../tour-execution/tour-problem.service';
import { TourProblem, ProblemCategory, ProblemPriority, ProblemStatus } from '../../tour-execution/model/tour-problem.model';

@Component({
  selector: 'app-tour-problem-list-admin',
  templateUrl: './tour-problem-list-admin.component.html',
  styleUrls: ['./tour-problem-list-admin.component.css']
})
export class TourProblemListAdminComponent implements OnInit {
  problems: TourProblem[] = [];
  filteredProblems: TourProblem[] = [];
  showOnlyOverdue: boolean = false;

  constructor(
    private tourProblemService: TourProblemService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.tourProblemService.getAllProblems().subscribe({
      next: (data) => {
        this.problems = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error loading problems:', err);
        alert('Error loading problems!');
      }
    });
  }

  applyFilter(): void {
    if (this.showOnlyOverdue) {
      this.filteredProblems = this.problems.filter(p => p.isOverdue);
    } else {
      this.filteredProblems = this.problems;
    }
  }

  toggleOverdueFilter(): void {
    this.showOnlyOverdue = !this.showOnlyOverdue;
    this.applyFilter();
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
    this.router.navigate(['/administration/tour-problems', problemId]);
  }

  getTruncatedDescription(description: string): string {
    if (!description) return '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }
}
