import { Component, OnInit } from '@angular/core';
import { TouristEquipmentService } from '../tourist-equipment.service';
import { EquipmentWithOwnership } from '../model/equipment-with-ownership.model';

@Component({
  selector: 'xp-tourist-equipment',
  templateUrl: './tourist-equipment.component.html',
  styleUrls: ['./tourist-equipment.component.css']
})
export class TouristEquipmentComponent implements OnInit {
  allEquipment: EquipmentWithOwnership[] = [];
  myEquipment: EquipmentWithOwnership[] = [];
  selectedTabIndex: number = 0;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private service: TouristEquipmentService) { }

  ngOnInit(): void {
    this.loadAllEquipment();
  }

  loadAllEquipment(): void {
    this.service.getAllEquipmentWithOwnership().subscribe({
      next: (result: EquipmentWithOwnership[]) => {
        this.allEquipment = result.sort((a, b) => a.name.localeCompare(b.name));
        this.updateMyEquipment();
      },
      error: () => {
        this.showError('Došlo je do greške prilikom učitavanja opreme.');
      }
    });
  }

  updateMyEquipment(): void {
    this.myEquipment = this.allEquipment
      .filter(eq => eq.isOwnedByTourist)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get ownedEquipmentCount(): number {
    return this.myEquipment.length;
  }

  onCheckboxChange(equipment: EquipmentWithOwnership, event: any): void {
    if (event.checked) {
      this.addEquipment(equipment.id);
    } else {
      this.removeEquipment(equipment.id);
    }
  }

  addEquipment(equipmentId: number): void {
    this.service.addEquipment(equipmentId).subscribe({
      next: () => {
        const equipment = this.allEquipment.find(eq => eq.id === equipmentId);
        if (equipment) {
          equipment.isOwnedByTourist = true;
        }
        this.updateMyEquipment();
        this.showSuccess('Oprema je dodata u vaš spisak');
      },
      error: () => {
        this.showError('Došlo je do greške. Molimo pokušajte ponovo.');
        this.loadAllEquipment();
      }
    });
  }

  removeEquipment(equipmentId: number): void {
    this.service.deleteEquipment(equipmentId).subscribe({
      next: () => {
        const equipment = this.allEquipment.find(eq => eq.id === equipmentId);
        if (equipment) {
          equipment.isOwnedByTourist = false;
        }
        this.updateMyEquipment();
        this.showSuccess('Oprema je uklonjena iz vašeg spiska');
      },
      error: () => {
        this.showError('Došlo je do greške. Molimo pokušajte ponovo.');
        this.loadAllEquipment();
      }
    });
  }

  onRemoveFromMyEquipment(equipmentId: number): void {
    this.removeEquipment(equipmentId);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3000);
  }
}