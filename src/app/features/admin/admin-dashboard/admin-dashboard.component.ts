import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AdminService } from '../../../core/services/admin.service';
import { StatsResponse } from '../../../core/models/admin.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  stats: StatsResponse | null = null;
  loading = true;
  error = '';

  ngOnInit() {
    this.adminService.getStats().pipe(finalize(() => this.loading = false)).subscribe({
      next: (s) => { this.stats = s; },
      error: (err) => { this.error = err.message || 'Failed to load statistics'; }
    });
  }
}
