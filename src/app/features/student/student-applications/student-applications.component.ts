import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationResponse } from '../../../core/models/application.models';

@Component({
  selector: 'app-student-applications',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule
  ],
  templateUrl: './student-applications.component.html',
  styleUrl: './student-applications.component.scss'
})
export class StudentApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);

  applications: ApplicationResponse[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.appService.getMyApplications().pipe(finalize(() => this.loading = false)).subscribe({
      next: (apps) => { this.applications = apps; },
      error: (err) => { this.error = err.message || 'Failed to load applications'; }
    });
  }
}
