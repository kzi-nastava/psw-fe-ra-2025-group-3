import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../../administration.service';
import { Monument } from '../../model/monument.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

@Component({
  selector: 'xp-monument-list',
  templateUrl: './monument-list.component.html',
  styleUrls: ['./monument-list.component.css']
})
export class MonumentListComponent implements OnInit {

  monuments: Monument[] = [];
  selectedMonument: Monument;
  shouldRenderMonumentForm: boolean = false;
  shouldEdit: boolean = false;

  constructor(private service: AdministrationService) { }

  ngOnInit(): void {
    this.getMonuments();
  }

  getMonuments(): void {
    this.service.getMonuments().subscribe({
      next: (result: PagedResults<Monument>) => {
        this.monuments = result.results;
      },
      error: () => {
      }
    });
  }

  deleteMonument(id: number): void {
    this.service.deleteMonument(id).subscribe({
      next: () => this.getMonuments()
    });
  }

  onEditClicked(monument: Monument): void {
    this.selectedMonument = monument;
    this.shouldRenderMonumentForm = true;
    this.shouldEdit = true;
  }

  onAddClicked(): void {
    this.shouldEdit = false;
    this.shouldRenderMonumentForm = true;
    this.selectedMonument = undefined as any; 
  }

  onMonumentUpdated(): void {
    this.getMonuments();
    this.shouldRenderMonumentForm = false;
    this.shouldEdit = false;
  }
}
