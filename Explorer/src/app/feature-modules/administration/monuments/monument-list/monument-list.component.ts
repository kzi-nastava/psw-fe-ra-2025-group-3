import { Component, OnInit } from '@angular/core';
import { Monument } from '../../model/monument.model';
import { MonumentService } from '../../monument.service';

@Component({
  selector: 'xp-monument-list',
  templateUrl: './monument-list.component.html',
  styleUrls: ['./monument-list.component.css']
})
export class MonumentListComponent implements OnInit {

  monuments: Monument[] = [];
  loading = false;
  error: string | null = null;

  constructor(private monumentService: MonumentService) {}

  ngOnInit(): void {
    this.loadMonuments();
  }

  loadMonuments(): void {
    this.loading = true;
    this.error = null;

    this.monumentService.getMonuments(0, 100).subscribe({
      next: (page) => {
        // PROVERI kako se zove polje u PagedResults:
        // pogledaj u EquipmentComponent da li koriste page.results ili page.items
        this.monuments = page.results;   // ako se zove drugačije, samo zameni
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Greška pri učitavanju spomenika.';
        this.loading = false;
      }
    });
  }
}
