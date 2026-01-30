import { Component, OnInit } from '@angular/core';
import { AchievementsService, AchievementDto } from './achievements.service';

interface AchievementIcon {
  code: string;
  title: string;
  iconPath: string;
}

@Component({
  selector: 'xp-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent implements OnInit {

  unlockedCodes = new Set<string>();

  

  toursCompleted: AchievementIcon[] = [
    { code: 'FirstTourCompleted', title: '1 tour completed', iconPath: 'assets/achievement-icons/oneTourCompleted.png' },
    { code: 'FiveToursCompleted', title: '5 tours completed', iconPath: 'assets/achievement-icons/fiveToursCompleted.png' },
    { code: 'TenToursCompleted', title: '10 tours completed', iconPath: 'assets/achievement-icons/tenToursCompleted.png' }
  ];

  tourReviews: AchievementIcon[] = [
    { code: 'FirstReviewWritten', title: '1 tour reviewed', iconPath: 'assets/achievement-icons/oneTourReviewed.png' },
    { code: 'FiveReviewsWritten', title: '5 tours reviewed', iconPath: 'assets/achievement-icons/fiveToursReviewed.png' },
    { code: 'TenReviewsWritten', title: '10 tours reviewed', iconPath: 'assets/achievement-icons/tenToursReviewed.png' }
  ];

  toursBought: AchievementIcon[] = [
    { code: 'FirstTourBought', title: 'Bought 1 tour', iconPath: 'assets/achievement-icons/boughtOneTour.png' },
    { code: 'FiveTourBought', title: 'Bought 5 tours', iconPath: 'assets/achievement-icons/boughtFiveTours.png' },
    { code: 'TenTourBought', title: 'Bought 10 tours', iconPath: 'assets/achievement-icons/boughtTenTours.png' }
  ];

  otherAchievements: AchievementIcon[] = [
    { code: 'FirstClubJoined', title: 'Joined a club', iconPath: 'assets/achievement-icons/joinedClub.png' },
    { code: 'FirstBlogCreated', title: 'Created a blog', iconPath: 'assets/achievement-icons/blogCreated.png' },
    { code: 'FirstAppReview', title: 'Reviewed the app', iconPath: 'assets/achievement-icons/appReviewed.png' },
    { code: 'FirstProfilePictureSet', title: 'Profile picture set', iconPath: 'assets/achievement-icons/profilePictureSet.png' }
  ];
  groups = [
    { title: 'Tours bought', items: this.toursBought },
    { title: 'Tours completed', items: this.toursCompleted },
    { title: 'Tour reviews', items: this.tourReviews },
    { title: 'Other achievements', items: this.otherAchievements }
  ];

  constructor(private achievementsService: AchievementsService) {}

  ngOnInit(): void {
    this.achievementsService.getForCurrentTourist().subscribe({
      next: (items: AchievementDto[]) => {
        this.unlockedCodes = new Set(items.map(i => i.code));
      },
      error: () => {
        // ako padne backend, ostaje sve zakljucano (zasivljeno)
        this.unlockedCodes = new Set<string>();
      }
    });
  }

  isUnlocked(code: string): boolean {
    return this.unlockedCodes.has(code);
  }
  get totalCount(): number {
    return (
      this.toursBought.length +
      this.toursCompleted.length +
      this.tourReviews.length +
      this.otherAchievements.length
    );
  }

  get unlockedCount(): number {
    const all = [
      ...this.toursBought,
      ...this.toursCompleted,
      ...this.tourReviews,
      ...this.otherAchievements
    ];

    let count = 0;
    for (const a of all) {
      if (this.unlockedCodes.has(a.code)) count++;
    }
    return count;
  }

  get unlockedPercent(): number {
    const total = this.totalCount;
    if (total === 0) return 0;
    return Math.round((this.unlockedCount / total) * 100);
  }
}