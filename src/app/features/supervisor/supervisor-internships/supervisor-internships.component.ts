import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { InternshipService } from '../../../core/services/internship.service';
import { InternshipResponse, InternshipStatus } from '../../../core/models/internship.models';

@Component({
  selector: 'app-supervisor-internships',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDividerModule
  ],
  templateUrl: './supervisor-internships.component.html',
  styleUrl: './supervisor-internships.component.scss'
})
export class SupervisorInternshipsComponent implements OnInit {
  private internshipService = inject(InternshipService);
  private snack = inject(MatSnackBar);

  internships: InternshipResponse[] = [];
  loading = true;
  error = '';
  editingNotes: { [id: number]: string } = {};
  updatingStatus: { [id: number]: boolean } = {};
  savingNotes: { [id: number]: boolean } = {};

  ngOnInit() {
    this.internshipService.getSupervised().pipe(finalize(() => this.loading = false)).subscribe({
      next: (data) => {
        this.internships = data;
        data.forEach(i => { this.editingNotes[i.id] = i.supervisorNotes ?? ''; });
      },
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
      error: (err) => this.snack.open(err.message || 'Update failed', 'OK', { duration: 3000 })
    });
  }

  saveNotes(i: InternshipResponse) {
    if (this.savingNotes[i.id]) return;

    this.savingNotes[i.id] = true;
    this.internshipService.addNotes(i.id, this.editingNotes[i.id] ?? '').pipe(
      finalize(() => this.savingNotes[i.id] = false)
    ).subscribe({
      next: (updated) => {
        Object.assign(i, updated);
        this.editingNotes[i.id] = updated.supervisorNotes ?? '';
        this.snack.open('Notes saved', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(err.message || 'Failed to save notes', 'OK', { duration: 3000 });
      }
    });
  }
}
