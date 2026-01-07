import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorProblemService } from '../author-problem.service';
import { TourProblem, Message, ProblemStatus, ProblemCategory, ProblemPriority, AuthorType } from '../../tour-execution/model/tour-problem.model';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-author-problem-details',
  templateUrl: './author-problem-details.component.html',
  styleUrls: ['./author-problem-details.component.css']
})
export class AuthorProblemDetailsComponent implements OnInit {
  @Input() problemId: number | null = null;
  @Output() back = new EventEmitter<void>();
  
  problem: TourProblem | null = null;
  loading: boolean = true;
  messageControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
  sendingMessage: boolean = false;
  isDialog: boolean = false;
  
  ProblemStatus = ProblemStatus;
  AuthorType = AuthorType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authorProblemService: AuthorProblemService
  ) { }

  ngOnInit(): void {
    // Ako je problemId prosleđen kao input, koristi ga (dialog mode)
    if (this.problemId) {
      this.isDialog = true;
      this.loadProblem(this.problemId);
    } else {
      // Inače učitaj iz rute (standard mode)
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
        this.loadProblem(id);
      }
    }
  }

  loadProblem(id: number): void {
    this.loading = true;
    this.authorProblemService.getProblemById(id).subscribe({
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
        this.router.navigate(['/author/tour-problems']);
      }
    });
  }

  sendMessage(): void {
    if (this.messageControl.invalid || !this.problem) return;

    const messageContent = this.messageControl.value!;
    this.sendingMessage = true;
    this.authorProblemService.addMessage(this.problem.id, { content: messageContent }).subscribe({
      next: (message) => {
        if (!this.problem!.messages) {
          this.problem!.messages = [];
        }
        if (message.authorType === undefined || message.authorType === null) {
          message.authorType = AuthorType.Author;
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
    if (this.isDialog) {
      // Ako je u dialog modu, emituj event nazad
      this.back.emit();
    } else {
      // Inače navigiraj na prethodnu stranicu
      this.router.navigate(['/author/tour-problems']);
    }
  }
}
