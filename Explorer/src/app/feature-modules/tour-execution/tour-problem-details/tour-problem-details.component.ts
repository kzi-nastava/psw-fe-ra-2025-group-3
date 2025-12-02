import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourProblemService } from '../tour-problem.service';
import { TourProblem, Message, ProblemStatus, ProblemCategory, ProblemPriority, AuthorType } from '../model/tour-problem.model';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-tour-problem-details',
  templateUrl: './tour-problem-details.component.html',
  styleUrls: ['./tour-problem-details.component.css']
})
export class TourProblemDetailsComponent implements OnInit {
  problem: TourProblem | null = null;
  loading: boolean = true;
  messageControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
  resolveCommentControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  showResolveDialog: boolean = false;
  showUnresolveDialog: boolean = false;
  sendingMessage: boolean = false;
  
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
    this.tourProblemService.getProblemById(id).subscribe({
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
        this.router.navigate(['/tour-execution/tour-problems']);
      }
    });
  }

  sendMessage(): void {
    if (this.messageControl.invalid || !this.problem) return;

    const messageContent = this.messageControl.value!;
    this.sendingMessage = true;
    this.tourProblemService.addMessage(this.problem.id, { content: messageContent }).subscribe({
      next: (message) => {
        if (!this.problem!.messages) {
          this.problem!.messages = [];
        }
        if (message.authorType === undefined || message.authorType === null) {
          message.authorType = AuthorType.Tourist;
        }
        if (!message.content) {
          message.content = messageContent;
        }
        if (!message.timestamp) {
          message.timestamp = new Date().toISOString();
        }
        this.problem!.messages = [...this.problem!.messages, message];
        this.messageControl.reset();
        this.sendingMessage = false;
      },
      error: (err) => {
        console.error('Error sending message:', err);
        alert('Failed to send message. Please try again.');
        this.sendingMessage = false;
      }
    });
  }

  openResolveDialog(): void {
    this.showResolveDialog = true;
  }

  openUnresolveDialog(): void {
    this.showUnresolveDialog = true;
  }

  closeDialogs(): void {
    this.showResolveDialog = false;
    this.showUnresolveDialog = false;
    this.resolveCommentControl.reset();
  }

  confirmResolve(): void {
    if (this.resolveCommentControl.invalid || !this.problem) return;

    this.tourProblemService.markResolved(this.problem.id, { touristComment: this.resolveCommentControl.value! }).subscribe({
      next: (updatedProblem) => {
        this.problem = updatedProblem;
        this.closeDialogs();
        alert('Problem marked as resolved!');
      },
      error: (err) => {
        console.error('Error marking as resolved:', err);
        alert('Error marking problem as resolved!');
      }
    });
  }

  confirmUnresolve(): void {
    if (this.resolveCommentControl.invalid || !this.problem) return;

    this.tourProblemService.markUnresolved(this.problem.id, { touristComment: this.resolveCommentControl.value! }).subscribe({
      next: (updatedProblem) => {
        this.problem = updatedProblem;
        this.closeDialogs();
        alert('Problem marked as unresolved!');
      },
      error: (err) => {
        console.error('Error marking as unresolved:', err);
        alert('Error marking problem as unresolved!');
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
    this.router.navigate(['/tour-execution/tour-problems']);
  }
}
