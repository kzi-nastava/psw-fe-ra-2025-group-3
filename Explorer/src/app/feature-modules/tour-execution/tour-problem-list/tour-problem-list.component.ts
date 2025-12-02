import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TourProblemService } from '../tour-problem.service';
import { TourProblem, ProblemCategory, ProblemPriority, ProblemStatus, TourProblemCreateDto, TourProblemUpdateDto } from '../model/tour-problem.model';

@Component({
  selector: 'app-tour-problem-list',
  templateUrl: './tour-problem-list.component.html',
  styleUrls: ['./tour-problem-list.component.css']
})
export class TourProblemListComponent implements OnInit {
  problems: TourProblem[] = [];
  showForm: boolean = false;
  selectedProblem: TourProblem | null = null;
  isEditMode: boolean = false;

  constructor(
    private tourProblemService: TourProblemService,
    private router: Router
  ) { }

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
        alert('Error loading problems!');
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
    this.router.navigate(['/tour-execution/tour-problems', problemId]);
  }

  onAddNew(): void {
    this.selectedProblem = null;
    this.isEditMode = false;
    this.showForm = true;
  }

  onEdit(problem: TourProblem): void {
    this.selectedProblem = problem;
    this.isEditMode = true;
    this.showForm = true;
  }

  onDelete(id: number): void {
   if (confirm('Are you sure you want to delete this report? This action cannot be undone.'))  {
      this.tourProblemService.deleteProblem(id).subscribe({
        next: () => {
          this.loadProblems();
         alert('Problem successfully deleted!');
        },
        error: (err) => {
          console.error('Error deleting problem:', err);
          alert('Error deleting problem!');
        }
      });
    }
  }

 
  onProblemCreated(event: TourProblemCreateDto): void {
    console.log('=== ON PROBLEM CREATED ===');
    console.log('Received data:', event);
    
    this.tourProblemService.createProblem(event).subscribe({
      next: (response) => {
        console.log('SUCCESS! Response:', response);
        this.loadProblems();
        this.showForm = false;
        alert('Problem successfully reported!');
      },
      error: (err) => {
        console.error('ERROR creating problem:', err);
        console.error('Error details:', err.error);
        console.error('Error status:', err.status);
        alert('Error creating problem!');
      }
    });
  }

  onProblemUpdated(event: TourProblemUpdateDto): void {
    console.log('=== ON PROBLEM UPDATED ===');
    console.log('Received data:', event);
    
    if (this.selectedProblem) {
      this.tourProblemService.updateProblem(this.selectedProblem.id, event).subscribe({
        next: (response) => {
          console.log('SUCCESS! Response:', response);
          this.loadProblems();
          this.showForm = false;
          this.selectedProblem = null;
          alert('Problem successfully updated!');
        },
        error: (err) => {
          console.error('ERROR updating problem:', err);
          console.error('Error details:', err.error);
          alert('Error updating problem!');
        }
      });
    }
  }

  onFormCanceled(): void {
    this.showForm = false;
    this.selectedProblem = null;
    this.isEditMode = false;
  }
}