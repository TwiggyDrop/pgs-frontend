import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApplicationService } from '../../../core/services/application.service';
import { InternshipService } from '../../../core/services/internship.service';
import { AdminService } from '../../../core/services/admin.service';
import { ApplicationResponse, ApplicationStatus } from '../../../core/models/application.models';
import { UserResponse } from '../../../core/models/auth.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [DatePipe, FormsModule, MatIconModule, MatProgressSpinnerModule, MatExpansionModule],
  templateUrl: './admin-applications.component.html',
  styleUrl: './admin-applications.component.scss',
})
export class AdminApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private internshipService = inject(InternshipService);
  private adminService = inject(AdminService);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  applications: ApplicationResponse[] = [];
  supervisors: UserResponse[] = [];
  loading = true;
  error = '';
  notes: { [id: number]: string } = {};
  selectedSupervisor: { [id: number]: number | null } = {};
  updatingStatus: { [id: number]: boolean } = {};
  creatingInternship: { [id: number]: boolean } = {};

  ngOnInit() {
    subscribeForView(
      forkJoin({
        applications: this.appService.getAll(),
        supervisors: this.adminService.getUsersByRole('SUPERVISOR'),
      }).pipe(finalize(() => (this.loading = false))),
      this.cdr,
      {
        next: ({ applications, supervisors }) => {
          this.applications = applications;
          this.supervisors = supervisors;
          applications.forEach((a) => {
            this.notes[a.id] = '';
            this.selectedSupervisor[a.id] = null;
          });
        },
        error: (err) => {
          this.error = err.message || 'Failed to load applications';
        },
      },
    );
  }

  updateStatus(app: ApplicationResponse, status: ApplicationStatus) {
    if (this.updatingStatus[app.id]) return;

    this.updatingStatus[app.id] = true;
    subscribeForView(
      this.appService
        .updateStatus(app.id, { status, adminNotes: this.notes[app.id] || undefined })
        .pipe(finalize(() => (this.updatingStatus[app.id] = false))),
      this.cdr,
      {
        next: (updated) => {
          Object.assign(app, updated);
          this.snack.open(`Status set to ${status}`, 'OK', { duration: 3000 });
        },
        error: (err) => this.snack.open(err.message || 'Failed', 'OK', { duration: 3000 }),
      },
    );
  }

  createInternship(app: ApplicationResponse) {
    if (this.creatingInternship[app.id]) return;

    this.creatingInternship[app.id] = true;
    subscribeForView(
      this.internshipService
        .create({
          applicationId: app.id,
          supervisorId: this.selectedSupervisor[app.id] ?? undefined,
        })
        .pipe(finalize(() => (this.creatingInternship[app.id] = false))),
      this.cdr,
      {
        next: () => {
          this.snack.open('Internship created!', 'OK', { duration: 3000 });
        },
        error: (err) => {
          this.snack.open(err.message || 'Failed to create internship', 'OK', { duration: 4000 });
        },
      },
    );
  }
}
