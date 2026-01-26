import { Component } from '@angular/core';

interface AchievementIcon {
  title: string;
  iconPath: string;
}

@Component({
  selector: 'xp-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent {

  toursCompleted: AchievementIcon[] = [
    {
      title: '1 tour completed',
      iconPath: 'assets/achievement-icons/oneTourCompleted.png'
    },
    {
      title: '5 tours completed',
      iconPath: 'assets/achievement-icons/fiveToursCompleted.png'
    },
    {
      title: '10 tours completed',
      iconPath: 'assets/achievement-icons/tenToursCompleted.png'
    }
  ];

  tourReviews: AchievementIcon[] = [
    {
      title: '1 tour reviewed',
      iconPath: 'assets/achievement-icons/oneTourReviewed.png'
    },
    {
      title: '5 tours reviewed',
      iconPath: 'assets/achievement-icons/fiveToursReviewed.png'
    },
    {
      title: '10 tours reviewed',
      iconPath: 'assets/achievement-icons/tenToursReviewed.png'
    }
  ];

  toursBought: AchievementIcon[] = [
    {
      title: 'Bought 1 tour',
      iconPath: 'assets/achievement-icons/boughtOneTour.png'
    },
    {
      title: 'Bought 5 tours',
      iconPath: 'assets/achievement-icons/boughtFiveTours.png'
    },
    {
      title: 'Bought 10 tours',
      iconPath: 'assets/achievement-icons/boughtTenTours.png'
    }
  ];

  otherAchievements: AchievementIcon[] = [
    {
      title: 'Joined a club',
      iconPath: 'assets/achievement-icons/joinedClub.png'
    },
    {
      title: 'Created a blog',
      iconPath: 'assets/achievement-icons/blogCreated.png'
    },
    {
      title: 'Reviewed the app',
      iconPath: 'assets/achievement-icons/appReviewed.png'
    },
    {
      title: 'Profile picture set',
      iconPath: 'assets/achievement-icons/profilePictureSet.png'
    }
  ];

}
