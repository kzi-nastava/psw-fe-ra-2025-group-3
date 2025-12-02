import { Component, Input } from '@angular/core';
import { KeyPoint } from '../model/key-point.model';

@Component({
  selector: 'xp-key-point-list',
  templateUrl: './key-point-list.component.html',
  styleUrls: ['./key-point-list.component.css']
})
export class KeyPointListComponent {
  @Input() keyPoints: KeyPoint[] = [];
}
