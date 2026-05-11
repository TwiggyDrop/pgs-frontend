import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InternshipService } from '../../../core/services/internship.service';
import { InternshipResponse, InternshipStatus } from '../../../core/models/internship.models';

@Component({
  selector: 'app-admin-internships',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatSelectModule, MatFormFieldModule
  ],
  templateUrl: './admin-internships.component.html',
  styleUrl: './admin-internships.component.scss'
})
export class AdminInternshipsComponent implements OnInit {
  private internshipService = inject(InternshipService);
  private snack = inject(MatSnackBar);

  internships: InternshipResponse[] = [];
  loading = true;
  error = '';
  updatingStatus: Record<number, boolean> = {};
  columns = ['student', 'offer', 'supervisor', 'status', 'dates', 'actions'];

  ngOnInit() {
    this.internshipService.getAll().pipe(finalize(() => this.loading = false)).subscribe({
      next: (data) => { this.internships = data; },
      error: (err) => { this.error = err.message || 'Failed to load internships'; }
    });
  }

  updateStatus(i: InternshipResponse, status: InternshipStatus) {
    if (this.updatingStatus[i.id]) return;

    this.updatingStatus[i.id] = true;
    this.internshipService.updateStatus(i.id, status).pipe(
      finalize(() => this.updatingStatus[i.id] = false)
    ).subscribe({
      next: (updated) => {
        Object.assign(i, updated);
        this.snack.open(`Status updated to ${status}`, 'OK', { duration: 3000 });
      },
      error: (err) => this.snack.open(err.message || 'Failed', 'OK', { duration: 3000 })
    });
  }
}
