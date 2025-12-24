import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthorProblemService } from '../author-problem.service';
import { TourProblem } from '../../tour-execution/model/tour-problem.model';

@Component({
  selector: 'app-tour-problems-dialog',
  templateUrl: './tour-problems-dialog.component.html',
  styleUrls: ['./tour-problems-dialog.component.css']
})
export class TourProblemsDialogComponent implements OnInit {
  tourId: number;
  tourName: string;
  problems: TourProblem[] = [];
  loading: boolean = true;
  selectedProblem: TourProblem | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authorProblemService: AuthorProblemService,
    public dialogRef: MatDialogRef<TourProblemsDialogComponent>
  ) {
    this.tourId = data.tourId;
    this.tourName = data.tourName;
  }

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.loading = true;
    this.authorProblemService.getTourProblems(this.tourId).subscribe({
      next: (allProblems) => {
        // Filtriraj samo probleme sa ove ture
        this.problems = (allProblems || []).filter(p => p.tourId === this.tourId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading problems:', error);
        this.problems = [];
        this.loading = false;
      }
    });
  }

  onViewDetails(problemId: number): void {
    const problem = this.problems.find(p => p.id === problemId);
    if (problem) {
      this.selectedProblem = problem;
    }
  }

  goBack(): void {
    this.selectedProblem = null;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getPriorityName(priority: number): string {
    const names: { [key: number]: string } = {
      0: 'Low',
      1: 'Medium',
      2: 'High',
      3: 'Critical'
    };
    return names[priority] || 'Unknown';
  }

  getStatusName(status: number): string {
    const names: { [key: number]: string } = {
      0: 'Open',
      1: 'Resolved',
      2: 'Unresolved',
      3: 'Closed'
    };
    return names[status] || 'Unknown';
  }

  getCategoryName(category: number): string {
    const names: { [key: number]: string } = {
      0: 'Transportation',
      1: 'Accommodation',
      2: 'Location',
      3: 'Food',
      4: 'Other'
    };
    return names[category] || 'Unknown';
  }

  getPriorityColor(priority: number): string {
    const colors: { [key: number]: string } = {
      0: '#4CAF50',
      1: '#FF9800',
      2: '#F44336',
      3: '#B71C1C'
    };
    return colors[priority] || '#9E9E9E';
  }

  getStatusColor(status: number): string {
    const colors: { [key: number]: string } = {
      0: '#2196F3',
      1: '#4CAF50',
      2: '#FF9800',
      3: '#757575'
    };
    return colors[status] || '#9E9E9E';
  }
}
