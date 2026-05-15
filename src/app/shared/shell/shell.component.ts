import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';
import { subscribeForView } from '../utils/view-subscribe';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

interface NavSection {
  heading?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatRippleModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private auth = inject(AuthService);
  private router = inject(Router);
  private breakpoints = inject(BreakpointObserver);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  sidenavOpened = true;
  sidenavMode: 'side' | 'over' = 'side';
  isCompact = false;
  isMobile = false;

  // Reactive user snapshot — updated when me() completes so navSections re-render
  currentUser: AuthResponse | null = this.auth.getUser();

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  private get role() {
    return this.currentUser?.role;
  }

  get userInitials(): string {
    const u = this.currentUser;
    if (!u) return '?';
    const f = u.firstName?.[0] ?? '';
    const l = u.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || '?';
  }

  get userFullName(): string {
    const u = this.currentUser;
    if (!u) return '';
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  }

  get navSections(): NavSection[] {
    const sections: NavSection[] = [];

    sections.push({
      items: [{ path: '/offers', icon: 'work_outline', label: 'Browse Offers' }],
    });

    if (this.role === 'STUDENT') {
      sections.push({
        heading: 'My Activity',
        items: [
          { path: '/student/applications', icon: 'assignment', label: 'My Applications' },
          { path: '/student/internships', icon: 'business_center', label: 'My Internships' },
        ],
      });
    }

    if (this.role === 'COMPANY') {
      sections.push({
        heading: 'Company',
        items: [{ path: '/company/offers', icon: 'add_business', label: 'My Offers' }],
      });
    }

    if (this.role === 'SUPERVISOR') {
      sections.push({
        heading: 'Supervision',
        items: [
          { path: '/supervisor/internships', icon: 'supervisor_account', label: 'Internships' },
        ],
      });
    }

    if (this.role === 'ADMIN') {
      sections.push({
        heading: 'Administration',
        items: [
          { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
          { path: '/admin/users', icon: 'people', label: 'Users' },
          { path: '/admin/applications', icon: 'description', label: 'Applications' },
          { path: '/admin/internships', icon: 'business_center', label: 'Internships' },
        ],
      });
    }

    return sections;
  }

  ngOnInit() {
    // Subscribe to auth state reactively so nav sections update when me() resolves
    subscribeForView(this.auth.currentUser().pipe(takeUntil(this.destroy$)), this.cdr, {
      next: (user) => {
        this.currentUser = user;
      },
    });

    // Refresh user profile from server once on shell init (fire-and-forget)
    if (this.auth.isLoggedIn()) {
      subscribeForView(this.auth.me().pipe(takeUntil(this.destroy$)), this.cdr, {
        error: () => undefined,
      });
    }

    subscribeForView(
      this.breakpoints.observe(['(max-width: 767px)']).pipe(takeUntil(this.destroy$)),
      this.cdr,
      {
        next: (result) => {
          this.isMobile = result.matches;
          if (this.isMobile) {
            this.sidenavMode = 'over';
            this.sidenavOpened = false;
            this.isCompact = false;
          } else {
            this.sidenavMode = 'side';
            this.sidenavOpened = true;
          }
        },
      },
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.sidenavOpened = !this.sidenavOpened;
    } else {
      this.isCompact = !this.isCompact;
    }
  }

  closeMobileNav() {
    if (this.isMobile) {
      this.sidenavOpened = false;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
