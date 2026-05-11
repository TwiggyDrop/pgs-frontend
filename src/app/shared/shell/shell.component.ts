import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule, MatTooltipModule
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  get user() { return this.auth.getUser(); }
  get isLoggedIn() { return this.auth.isLoggedIn(); }
  get isStudent() { return this.user?.role === 'STUDENT'; }
  get isCompany() { return this.user?.role === 'COMPANY'; }
  get isSupervisor() { return this.user?.role === 'SUPERVISOR'; }
  get isAdmin() { return this.user?.role === 'ADMIN'; }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.auth.me().subscribe({ error: () => undefined });
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
