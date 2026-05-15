import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { StatsResponse } from '../../../core/models/admin.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  stats: StatsResponse | null = null;
  loading = true;
  error = '';

  ngOnInit() {
    subscribeForView(
      this.adminService.getStats().pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      ),
      this.cdr,
      {
        next: (s) => {
          this.stats = s;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load statistics';
        },
      },
    );
  }
}
