import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApplicationService } from '../../../core/services/application.service';
import { InternshipService } from '../../../core/services/internship.service';
import { AdminService } from '../../../core/services/admin.service';
import { ApplicationResponse, ApplicationStatus } from '../../../core/models/application.models';
import { UserResponse } from '../../../core/models/auth.models';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule, MatExpansionModule,
    MatSelectModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './admin-applications.component.html',
  styleUrl: './admin-applications.component.scss'
})
export class AdminApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private internshipService = inject(InternshipService);
  private adminService = inject(AdminService);
  private snack = inject(MatSnackBar);

  applications: ApplicationResponse[] = [];
  supervisors: UserResponse[] = [];
  loading = true;
  error = '';
  notes: { [id: number]: string } = {};
  selectedSupervisor: { [id: number]: number | null } = {};
  updatingStatus: { [id: number]: boolean } = {};
  creatingInternship: { [id: number]: boolean } = {};

  ngOnInit() {
    forkJoin({
      applications: this.appService.getAll(),
      supervisors: this.adminService.getUsersByRole('SUPERVISOR')
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ applications, supervisors }) => {
        this.applications = applications;
        this.supervisors = supervisors;
        applications.forEach(a => {
          this.notes[a.id] = '';
          this.selectedSupervisor[a.id] = null;
        });
      },
      error: (err) => { this.error = err.message || 'Failed to load applications'; }
    });
  }

  updateStatus(app: ApplicationResponse, status: ApplicationStatus) {
    if (this.updatingStatus[app.id]) return;

    this.updatingStatus[app.id] = true;
    this.appService.updateStatus(app.id, { status, adminNotes: this.notes[app.id] || undefined }).pipe(
      finalize(() => this.updatingStatus[app.id] = false)
    ).subscribe({
      next: (updated) => {
        Object.assign(app, updated);
        this.snack.open(`Status set to ${status}`, 'OK', { duration: 3000 });
      },
      error: (err) => this.snack.open(err.message || 'Failed', 'OK', { duration: 3000 })
    });
  }

  createInternship(app: ApplicationResponse) {
    if (this.creatingInternship[app.id]) return;

    this.creatingInternship[app.id] = true;
    this.internshipService.create({
      applicationId: app.id,
      supervisorId: this.selectedSupervisor[app.id] ?? undefined
    }).pipe(
      finalize(() => this.creatingInternship[app.id] = false)
    ).subscribe({
      next: () => {
        this.snack.open('Internship created!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(err.message || 'Failed to create internship', 'OK', { duration: 4000 });
      }
    });
  }
}
