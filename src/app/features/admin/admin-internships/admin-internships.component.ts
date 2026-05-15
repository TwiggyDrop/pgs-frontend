import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InternshipService } from '../../../core/services/internship.service';
import { InternshipResponse, InternshipStatus } from '../../../core/models/internship.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';

@Component({
  selector: 'app-admin-internships',
  standalone: true,
  imports: [DatePipe, MatTableModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './admin-internships.component.html',
  styleUrl: './admin-internships.component.scss',
})
export class AdminInternshipsComponent implements OnInit {
  private internshipService = inject(InternshipService);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  internships: InternshipResponse[] = [];
  loading = true;
  error = '';
  updatingStatus: Record<number, boolean> = {};
  columns = ['student', 'offer', 'supervisor', 'status', 'dates', 'actions'];

  ngOnInit() {
    subscribeForView(
      this.internshipService.getAll().pipe(finalize(() => (this.loading = false))),
      this.cdr,
      {
        next: (data) => {
          this.internships = data;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load internships';
        },
      },
    );
  }

  updateStatus(i: InternshipResponse, status: InternshipStatus) {
    if (this.updatingStatus[i.id]) return;

    this.updatingStatus[i.id] = true;
    subscribeForView(
      this.internshipService
        .updateStatus(i.id, status)
        .pipe(finalize(() => (this.updatingStatus[i.id] = false))),
      this.cdr,
      {
        next: (updated) => {
          Object.assign(i, updated);
          this.snack.open(`Status updated to ${status}`, 'OK', { duration: 3000 });
        },
        error: (err) => this.snack.open(err.message || 'Failed', 'OK', { duration: 3000 }),
      },
    );
  }
}
