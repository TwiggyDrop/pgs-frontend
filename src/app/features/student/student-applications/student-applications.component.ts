import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationResponse } from '../../../core/models/application.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';

@Component({
  selector: 'app-student-applications',
  standalone: true,
  imports: [RouterLink, DatePipe, SlicePipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './student-applications.component.html',
  styleUrl: './student-applications.component.scss',
})
export class StudentApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private cdr = inject(ChangeDetectorRef);

  applications: ApplicationResponse[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    subscribeForView(
      this.appService.getMyApplications().pipe(finalize(() => (this.loading = false))),
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
}
