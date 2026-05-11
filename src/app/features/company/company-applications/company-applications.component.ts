import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationResponse, ApplicationStatus } from '../../../core/models/application.models';

@Component({
  selector: 'app-company-applications',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatProgressSpinnerModule, MatInputModule, MatExpansionModule
  ],
  templateUrl: './company-applications.component.html',
  styleUrl: './company-applications.component.scss'
})
export class CompanyApplicationsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private appService = inject(ApplicationService);
  private snack = inject(MatSnackBar);

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
    this.appService.getForOffer(this.offerId).pipe(finalize(() => this.loading = false)).subscribe({
      next: (apps) => { this.applications = apps; },
      error: (err) => { this.error = err.message || 'Failed to load applications'; }
    });
  }

  updateStatus(app: ApplicationResponse, status: ApplicationStatus, notes?: string) {
    if (this.updatingStatus[app.id]) return;

    this.updatingStatus[app.id] = true;
    this.appService.updateStatus(app.id, { status, adminNotes: notes }).pipe(
      finalize(() => this.updatingStatus[app.id] = false)
    ).subscribe({
      next: (updated) => {
        Object.assign(app, updated);
        this.snack.open(`Status updated to ${status}`, 'OK', { duration: 3000 });
      },
      error: (err) => this.snack.open(err.message || 'Update failed', 'OK', { duration: 3000 })
    });
  }
}
