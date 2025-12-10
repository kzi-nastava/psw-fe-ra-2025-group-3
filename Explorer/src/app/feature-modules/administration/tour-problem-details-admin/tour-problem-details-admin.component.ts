import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourProblemService } from '../../tour-execution/tour-problem.service';
import { TourProblem, ProblemStatus, ProblemCategory, ProblemPriority, AuthorType, AdminDeadlineDto} from '../../tour-execution/model/tour-problem.model';

@Component({
  selector: 'app-tour-problem-details-admin',
  templateUrl: './tour-problem-details-admin.component.html',
  styleUrls: ['./tour-problem-details-admin.component.css']
})
export class TourProblemDetailsAdminComponent implements OnInit {
  problem: TourProblem | null = null;
  loading: boolean = true;

  deadlineInput: string = '';    
  savingDeadline: boolean = false;
  closing: boolean = false;
  penalizing: boolean = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;
  
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
        if (this.problem.adminDeadline) {
          const d = new Date(this.problem.adminDeadline);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
          this.deadlineInput = local.toISOString().slice(0, 16);

          this.problem.isDeadlineExpired = d.getTime() < Date.now();
        } else {
          this.problem.isDeadlineExpired = false;
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

  onSetDeadline(): void {
    if (!this.problem) return;
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.deadlineInput) {
      this.errorMessage = 'Please select a deadline.';
      return;
    }

    const selectedDate = new Date(this.deadlineInput);

    if (selectedDate <= new Date()) {
      this.errorMessage = 'Deadline must be in the future.';
      return;
    }

    this.savingDeadline = true;

    const dto: AdminDeadlineDto = {
      deadline: selectedDate.toISOString()  
    };

    this.tourProblemService.setDeadline(this.problem.id, dto).subscribe({
      next: () => {
        this.savingDeadline = false;
        this.successMessage = 'Deadline successfully set.';
        this.loadProblem(this.problem!.id);
      },
      error: (err) => {
        console.error('Error setting deadline:', err);
        this.savingDeadline = false;

        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Failed to set deadline.';
        }
      }
    });
  }

  onCloseProblem(): void {
    if (!this.problem) return;
    this.successMessage = null;
    this.errorMessage = null;
    this.closing = true;

    this.tourProblemService.closeProblem(this.problem.id).subscribe({
      next: () => {
        this.closing = false;
        this.successMessage = 'Problem successfully closed.';
        this.loadProblem(this.problem!.id);
      },
      error: (err) => {
        console.error('Error closing problem:', err);
        this.closing = false;
        this.errorMessage = 'Failed to close problem.';
      }
    });
  }

  onPenalizeAuthor(): void {
    if (!this.problem) return;
    this.successMessage = null;
    this.errorMessage = null;
    this.penalizing = true;

    if (!confirm('Are you sure you want to penalize the author and deactivate the tour?')) {
      this.penalizing = false;
      return;
    }

    this.tourProblemService.penalizeAuthor(this.problem.id).subscribe({
      next: () => {
        this.penalizing = false;
        this.successMessage = 'Author penalized and tour archived.';
      },
      error: (err) => {
        console.error('Error penalizing author:', err);
        this.penalizing = false;

        if (err?.error?.message) {
          this.errorMessage = err.error.message;  
        } else {
          this.errorMessage = 'Failed to penalize the author. The author might have already been penalized.';
        }
      }
    });
  }
}
