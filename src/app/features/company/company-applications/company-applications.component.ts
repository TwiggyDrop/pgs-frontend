import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationResponse, ApplicationStatus } from '../../../core/models/application.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-company-applications',
  standalone: true,
  imports: [TranslatePipe, RouterLink, DatePipe, MatIconModule, MatProgressSpinnerModule, MatExpansionModule],
  templateUrl: './company-applications.component.html',
  styleUrl: './company-applications.component.scss',
})
export class CompanyApplicationsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private appService = inject(ApplicationService);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  offerId!: number;
  applications: ApplicationResponse[] = [];
  loading = true;
  error = '';
  updatingStatus: Record<number, boolean> = {};
  columns = ['student', 'appliedAt', 'status', 'actions'];

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('offerId'));
    if (!Number.isInteger(this.offerId) || this.offerId <= 0) {
      this.error = 'Invalid offer id';
      this.loading = false;
      return;
    }
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    subscribeForView(
      this.appService.getForOffer(this.offerId).pipe(finalize(() => (this.loading = false))),
      this.cdr,
      {
        next: (apps) => {
          this.applications = apps;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load applications';
        },
      },
    );
  }

  updateStatus(app: ApplicationResponse, status: ApplicationStatus, notes?: string) {
    if (this.updatingStatus[app.id]) return;

    this.updatingStatus[app.id] = true;
    subscribeForView(
      this.appService
        .updateStatus(app.id, { status, adminNotes: notes })
        .pipe(finalize(() => (this.updatingStatus[app.id] = false))),
      this.cdr,
      {
        next: (updated) => {
          Object.assign(app, updated);
          this.snack.open(`Status updated to ${status}`, 'OK', { duration: 3000 });
        },
        error: (err) => this.snack.open(err.message || 'Update failed', 'OK', { duration: 3000 }),
      },
    );
  }
}

