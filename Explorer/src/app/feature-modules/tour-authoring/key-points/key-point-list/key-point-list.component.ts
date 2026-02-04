import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KeyPoint } from '../model/key-point.model';

@Component({
  selector: 'xp-key-point-list',
  templateUrl: './key-point-list.component.html',
  styleUrls: ['./key-point-list.component.css']
})
export class KeyPointListComponent {
  @Input() keyPoints: KeyPoint[] = [];

  @Output() keyPointSelected = new EventEmitter<KeyPoint>();
  @Output() keyPointDelete = new EventEmitter<KeyPoint>();

  onItemClick(kp: KeyPoint) {
    this.keyPointSelected.emit(kp);
  }

  onDeleteClick(kp: KeyPoint, event: MouseEvent) {
    event.stopPropagation();
    this.keyPointDelete.emit(kp);
  }
}
