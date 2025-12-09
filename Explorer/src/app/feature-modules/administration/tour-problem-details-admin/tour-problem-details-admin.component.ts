import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourProblemService } from '../../tour-execution/tour-problem.service';
import { TourProblem, ProblemStatus, ProblemCategory, ProblemPriority, AuthorType } from '../../tour-execution/model/tour-problem.model';

@Component({
  selector: 'app-tour-problem-details-admin',
  templateUrl: './tour-problem-details-admin.component.html',
  styleUrls: ['./tour-problem-details-admin.component.css']
})
export class TourProblemDetailsAdminComponent implements OnInit {
  problem: TourProblem | null = null;
  loading: boolean = true;
  
  ProblemStatus = ProblemStatus;
  AuthorType = AuthorType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourProblemService: TourProblemService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProblem(id);
    }
  }

  loadProblem(id: number): void {
    this.loading = true;
    this.tourProblemService.getProblemByIdForAdmin(id).subscribe({
      next: (data) => {
        this.problem = data;
        if (!this.problem.messages) {
          this.problem.messages = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading problem:', err);
        alert('Error loading problem details!');
        this.loading = false;
        this.router.navigate(['/administration/tour-problems']);
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

  getAuthorTypeName(authorType: AuthorType): string {
    switch (authorType) {
      case AuthorType.Tourist: return 'Tourist';
      case AuthorType.Author: return 'Author';
      case AuthorType.Admin: return 'Admin';
      default: return 'Unknown';
    }
  }

  goBack(): void {
    this.router.navigate(['/administration/tour-problems']);
  }
}
