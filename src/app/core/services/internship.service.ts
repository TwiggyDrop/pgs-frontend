import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CreateInternshipRequest,
  InternshipResponse,
  InternshipStatus
} from '../models/internship.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InternshipService {
  private readonly base = `${environment.apiUrl}/internships`;

  constructor(private api: ApiService) {}

  create(request: CreateInternshipRequest): Observable<InternshipResponse> {
    return this.api.post<InternshipResponse>(this.base, {
      applicationId: this.assertId(request.applicationId, 'application'),
      supervisorId: request.supervisorId ? this.assertId(request.supervisorId, 'supervisor') : undefined,
      startDate: request.startDate,
      endDate: request.endDate
    });
  }

  getAll(): Observable<InternshipResponse[]> {
    return this.api.get<InternshipResponse[]>(this.base);
  }

  getById(id: number): Observable<InternshipResponse> {
    return this.api.get<InternshipResponse>(`${this.base}/${this.assertId(id, 'internship')}`);
  }

  getMyInternships(): Observable<InternshipResponse[]> {
    return this.api.get<InternshipResponse[]>(`${this.base}/my`);
  }

  getSupervised(): Observable<InternshipResponse[]> {
    return this.api.get<InternshipResponse[]>(`${this.base}/supervised`);
  }

  updateStatus(id: number, status: InternshipStatus): Observable<InternshipResponse> {
    const internshipId = this.assertId(id, 'internship');
    return this.api.patch<InternshipResponse>(`${this.base}/${internshipId}/status`, { status }).pipe(
      switchMap(() => this.getById(internshipId))
    );
  }

  addNotes(id: number, notes: string): Observable<InternshipResponse> {
    const internshipId = this.assertId(id, 'internship');
    return this.api.patch<InternshipResponse>(`${this.base}/${internshipId}/notes`, {
      notes: notes.trim()
    }).pipe(
      switchMap(() => this.getById(internshipId))
    );
  }

  private assertId(id: number, label: string): number {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid ${label} id`);
    }
    return id;
  }
}
