import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WelcomeBonus, BonusType } from 'src/app/feature-modules/stakeholders/model/welcome-bonus.model';

interface WheelOption {
  type: BonusType;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'xp-welcome-bonus-modal',
  templateUrl: './welcome-bonus-modal.component.html',
  styleUrls: ['./welcome-bonus-modal.component.css']
})
export class WelcomeBonusModalComponent implements OnInit, AfterViewInit {
  bonus: WelcomeBonus;
  isSpinning = false;
  rotation = 0;
  selectedIndex = 0;
  showResult = false;

  wheelOptions: WheelOption[] = [
    { type: BonusType.AC100, label: '100 AC', icon: '💰', color: '#4A90E2' },
    { type: BonusType.AC250, label: '250 AC', icon: '💰', color: '#5BA3F5' },
    { type: BonusType.AC500, label: '500 AC', icon: '💰', color: '#6BB6FF' },
    { type: BonusType.Discount10, label: '10%', icon: '🎁', color: '#7BC7FF' },
    { type: BonusType.Discount20, label: '20%', icon: '🎁', color: '#8BD8FF' },
    { type: BonusType.Discount30, label: '30%', icon: '🎁', color: '#9CE9FF' }
  ];

  constructor(
    public dialogRef: MatDialogRef<WelcomeBonusModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bonus: WelcomeBonus }
  ) {
    this.bonus = data.bonus;
  }

  ngOnInit(): void {
    // Find the index of the received bonus
    this.selectedIndex = this.wheelOptions.findIndex(opt => opt.type === this.bonus.bonusType);
    if (this.selectedIndex === -1) {
      this.selectedIndex = 0;
    }
    
    // Set initial rotation to 0 so all segments are visible
    this.rotation = 0;
  }

  ngAfterViewInit(): void {
    // Wheel will spin when user clicks the button
  }

  spinWheel(): void {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    this.showResult = false;

    // Calculate rotation to land on the selected segment
    // Each segment is 60 degrees (360/6)
    // Pointer is at the top (0 degrees)
    // Segments start at: 0°, 60°, 120°, 180°, 240°, 300°
    // Segment centers are at: 30°, 90°, 150°, 210°, 270°, 330°
    
    const baseRotation = 1800; // 5 full rotations for spinning effect
    const segmentAngle = 60; // Each segment is 60 degrees
    const segmentCenterOffset = 30; // Center of each segment is 30 degrees from its start
    
    // Calculate the angle of the selected segment's center
    const segmentCenterAngle = this.selectedIndex * segmentAngle + segmentCenterOffset;
    
    // To bring the segment center to the top (0°), we need to rotate backwards
    // Formula: rotate wheel so that segment center aligns with top pointer
    const targetAngle = 360 - segmentCenterAngle;
    const targetRotation = baseRotation + targetAngle;
    
    this.rotation = targetRotation;

    // Show result after animation completes
    setTimeout(() => {
      this.isSpinning = false;
      this.showResult = true;
    }, 3000); // Animation lasts 3 seconds
  }

  getBonusMessage(): string {
    if (this.bonus.bonusType === BonusType.AC100 || 
        this.bonus.bonusType === BonusType.AC250 || 
        this.bonus.bonusType === BonusType.AC500) {
      return `Congratulations! You received ${this.bonus.value} AC in your wallet!`;
    } else {
      return `Congratulations! You received ${this.bonus.value}% discount on your first purchase!`;
    }
  }

  getBonusIcon(): string {
    if (this.bonus.bonusType === BonusType.AC100 || 
        this.bonus.bonusType === BonusType.AC250 || 
        this.bonus.bonusType === BonusType.AC500) {
      return '💰';
    } else {
      return '🎁';
    }
  }

  getWheelTransform(): string {
    return `rotate(${this.rotation}deg)`;
  }

  getContentTransform(segmentIndex: number): string {
    // Counter-rotate text to keep it upright as wheel rotates
    // All segments need translate(-50%, -50%) to center the content
    const counterRotation = -this.rotation;
    return `translate(-50%, -50%) rotate(${counterRotation}deg)`;
  }

  close(): void {
    this.dialogRef.close();
  }
}
