import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlogService } from 'src/app/feature-modules/blog/blog.service';
import { Blog, BlogStatus } from 'src/app/feature-modules/blog/model/blog.model';
import Swiper from 'swiper';
import { Pagination, EffectCards, Autoplay } from 'swiper/modules';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  backgroundImages: string[] = [
    'assets/images/pozadina.jpg',
    'assets/images/pozadina2.jpg',
    'assets/images/pozadina3.jpg'
  ];

  currentBackgroundIndex: number = 0;
  private backgroundInterval: any;
  private userSubscription?: Subscription;

  isLoggedIn: boolean = false;

  // 🔹 Latest Blogs
  latestBlogs: Blog[] = [];
  isLoadingBlogs: boolean = false;

  // 🔹 Mobile Swiper
  isMobile: boolean = false;
  private blogSwiper: Swiper | null = null;
  currentBlogIndex: number = 0;

  constructor(
    private authService: AuthService,
    private blogService: BlogService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.startBackgroundRotation();
    this.loadLatestBlogs();
    this.checkMobile();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initScrollReveal(), 500);
  }

  ngOnDestroy(): void {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.blogSwiper) {
      this.blogSwiper.destroy();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  private checkMobile(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    // Ako se promijenilo stanje, reinicijalizuj swiper
    if (wasMobile !== this.isMobile && this.latestBlogs.length > 0) {
      setTimeout(() => this.initBlogSwiper(), 100);
    }
  }

  private initBlogSwiper(): void {
    if (this.blogSwiper) {
      this.blogSwiper.destroy();
      this.blogSwiper = null;
    }

    if (this.isMobile && this.latestBlogs.length > 0) {
      setTimeout(() => {
        const swiperEl = document.querySelector('.blog-swiper') as HTMLElement;
        if (swiperEl) {
          this.blogSwiper = new Swiper('.blog-swiper', {
            modules: [Pagination, Autoplay],
            slidesPerView: 1,
            spaceBetween: 0,
            centeredSlides: false,
            loop: true,
            speed: 400,
            autoplay: {
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            },
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
              dynamicBullets: false
            },
            grabCursor: true,
            touchEventsTarget: 'container',
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: true,
            allowTouchMove: true,
            threshold: 5,
            on: {
              slideChange: () => {
                if (this.blogSwiper) {
                  this.currentBlogIndex = this.blogSwiper.realIndex;
                }
              }
            }
          });
        }
      }, 200);
    }
  }

  checkAuthStatus(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!(user && user.id !== 0 && user.username !== "");
    });
  }

  startBackgroundRotation(): void {
    this.backgroundInterval = setInterval(() => {
      this.currentBackgroundIndex =
        (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
    }, 7000);
  }

  getCurrentBackground(): string {
    return this.backgroundImages[this.currentBackgroundIndex];
  }

  // 🔹 Load Latest Blogs
  loadLatestBlogs(): void {
    this.isLoadingBlogs = true;

    // Prvo pokušaj javni endpoint, pa ako ne uspije probaj standardni
    this.blogService.getPublicBlogs().subscribe({
      next: (blogs) => {
        this.processBlogs(blogs);
      },
      error: () => {
        // Ako javni endpoint ne postoji, probaj standardni (radi ako je korisnik ulogovan)
        this.blogService.getAllBlogs().subscribe({
          next: (blogs) => {
            this.processBlogs(blogs);
          },
          error: (err) => {
            console.error('Error loading blogs:', err);
            this.isLoadingBlogs = false;
          }
        });
      }
    });
  }

  private processBlogs(blogs: Blog[]): void {
    // Sort by creation date (newest first) and take the last 3
    this.latestBlogs = blogs
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
      .slice(0, 3);
    this.isLoadingBlogs = false;

    // Inicijalizuj swiper nakon što se blogovi učitaju
    setTimeout(() => this.initBlogSwiper(), 300);
  }

  // 🔹 Blog Helper Methods
  getImageUrl(blog: Blog): string {
    if (blog.images && blog.images.length > 0) {
      return blog.images[0].imageUrl;
    }
    return 'assets/images/pozadina.jpg';
  }

  getBlogStatus(status: BlogStatus): string {
    switch (status) {
      case BlogStatus.Active: return 'ACTIVE';
      case BlogStatus.Famous: return 'FAMOUS';
      case BlogStatus.ReadOnly: return 'READ-ONLY';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  truncateMarkdown(text: string, maxLength: number): string {
    if (!text) return '';
    const plainText = text.replace(/[#*_~`>\[\]()!-]/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }

  viewBlog(blogId: number): void {
    this.router.navigate(['/demo']);
  }

  private initScrollReveal(): void {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
}
