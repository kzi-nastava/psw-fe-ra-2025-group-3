import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TouristStats, getRankConfig, calculateXpProgress, calculateProgressPercentage, calculateXpForNextLevel, calculateXpRemaining } from '../../stakeholders/model/tourist-stats.model';

@Component({
  selector: 'xp-level-progress-dialog',
  templateUrl: './level-progress-dialog.component.html',
  styleUrls: ['./level-progress-dialog.component.css']
})
export class LevelProgressDialogComponent {
  rankConfig = getRankConfig(this.data.level);
  xpProgress = calculateXpProgress(this.data.xp);
  progressPercentage = calculateProgressPercentage(this.data.xp);
  xpForNextLevel = calculateXpForNextLevel();
  xpRemaining = calculateXpRemaining(this.data.xp);

  constructor(
    public dialogRef: MatDialogRef<LevelProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TouristStats
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
