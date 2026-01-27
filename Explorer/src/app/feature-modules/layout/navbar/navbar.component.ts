import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { StakeholderService } from '../../stakeholders/stakeholder.service';
import { Person } from '../../stakeholders/model/person.model';
import { ShoppingCartService } from '../../stakeholders/shopping-cart.service';
import { ShoppingCart } from '../../stakeholders/model/shopping-cart.model';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { NotificationBadgeComponent } from '../notification-badge/notification-badge.component';
import { MatDialog } from '@angular/material/dialog';
import { LevelProgressDialogComponent } from '../level-progress-dialog/level-progress-dialog.component';
import { TouristStats, getRankConfig } from '../../stakeholders/model/tourist-stats.model';

@Component({
  selector: 'xp-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  user: User | undefined;
  profilePictureUrl: string = '';
  cartItemsCount: number = 0;
  isCartDropdownOpen: boolean = false;
  touristStats: TouristStats | null = null;
  rankConfig: any = null;
  private destroy$ = new Subject<void>();

  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;
  @ViewChild(NotificationBadgeComponent) notificationBadge!: NotificationBadgeComponent;

  constructor(
    private authService: AuthService,
    private stakeholderService: StakeholderService,
    private shoppingCartService: ShoppingCartService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user && user.username !== '') {
        this.loadProfile();
        if (user.role === 'tourist') {
          this.loadCart();
          this.loadTouristStats();
        }
      } else {
        this.profilePictureUrl = '';
        this.cartItemsCount = 0;
        this.touristStats = null;
        this.rankConfig = null;
      }
    });

    // Osvežavaj korpu kada se promeni
    this.shoppingCartService.cartUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.user && this.user.role === 'tourist') {
          this.loadCart();
        }
      });

    // Osvežavaj tourist stats kada se promeni
    this.stakeholderService.touristStatsUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.user && this.user.role === 'tourist') {
          this.loadTouristStats();
        }
      });

    // Osvežavaj korpu kada se naviguje na stranicu
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.user && this.user.role === 'tourist') {
          this.loadCart();
          this.loadTouristStats();
        }
      });
  }

  ngAfterViewInit(): void {
    // Subscribe to menu open events to close other menus
    this.menuTriggers.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.setupMenuListeners();
      });
    
    // Initial setup
    setTimeout(() => {
      this.setupMenuListeners();
    }, 0);
  }

  private setupMenuListeners(): void {
    this.menuTriggers.forEach(trigger => {
      trigger.menuOpened.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.closeAllOtherMenus(trigger);
        this.closeCartDropdown();
        this.closeNotificationDropdown();
      });
    });
  }

  private closeAllOtherMenus(currentTrigger: MatMenuTrigger): void {
    this.menuTriggers.forEach(trigger => {
      if (trigger !== currentTrigger && trigger.menuOpen) {
        trigger.closeMenu();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.stakeholderService.getProfile().subscribe({
      next: (profile: Person) => {
        this.profilePictureUrl = profile.profilePictureUrl || '';
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.profilePictureUrl = '';
      }
    });
  }

  loadCart(): void {
    this.shoppingCartService.getMyCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart: ShoppingCart) => {
          const itemsCount = cart.items?.length || 0;
          const bundleItemsCount = cart.bundleItems?.length || 0;
          this.cartItemsCount = itemsCount + bundleItemsCount;
        },
        error: () => {
          this.cartItemsCount = 0;
        }
      });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://ionicframework.com/docs/img/demos/avatar.svg';
    }
  }

  toggleCartDropdown(): void {
    const wasOpen = this.isCartDropdownOpen;
    this.closeAllMenus();
    this.closeNotificationDropdown();
    this.isCartDropdownOpen = !wasOpen;
  }

  closeCartDropdown(): void {
    this.isCartDropdownOpen = false;
  }

  private closeAllMenus(): void {
    this.menuTriggers?.forEach(trigger => {
      if (trigger.menuOpen) {
        trigger.closeMenu();
      }
    });
  }

  onNotificationDropdownOpened(): void {
    this.closeAllMenus();
    this.closeCartDropdown();
  }

  private closeNotificationDropdown(): void {
    if (this.notificationBadge?.isDropdownOpen) {
      this.notificationBadge.closeDropdown();
    }
  }


  loadTouristStats(): void {
    this.stakeholderService.getTouristStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: TouristStats) => {
          const previousLevel = this.touristStats?.level || 0;
          this.touristStats = stats;
          this.rankConfig = getRankConfig(stats.level);
          
          // Auto-claim rank rewards if level increased
          if (previousLevel > 0 && stats.level > previousLevel) {
            this.claimRankRewards();
          } else if (previousLevel === 0) {
            // First load - check for unclaimed rewards
            this.claimRankRewards();
          }
        },
        error: (err) => {
          console.error('Failed to load tourist stats:', err);
          this.touristStats = null;
          this.rankConfig = null;
        }
      });
  }

  claimRankRewards(): void {
    this.stakeholderService.claimRankRewards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.acAwarded > 0) {
            alert(`🎉 Rank Reward Claimed!\n\n${response.message}\n+${response.acAwarded} AC added to your wallet!`);
          }
        },
        error: (err) => {
          console.error('Failed to claim rank rewards:', err);
        }
      });
  }

  openLevelDialog(): void {
    if (this.touristStats) {
      this.dialog.open(LevelProgressDialogComponent, {
        data: this.touristStats,
        width: '600px',
        maxWidth: '90vw',
        panelClass: 'level-dialog'
      });
    }
  }
  goToTopAuthors(): void {
  this.router.navigate(['/tourist/authors']);
}
  onLogout(): void {
    this.authService.logout();
  }
}