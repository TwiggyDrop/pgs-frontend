import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApplyRequest,
  ApplicationResponse,
  UpdateApplicationStatusRequest
} from '../models/application.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly base = `${environment.apiUrl}/applications`;

  constructor(private api: ApiService) {}

  apply(request: ApplyRequest): Observable<ApplicationResponse> {
    return this.api.post<ApplicationResponse>(this.base, {
      offerId: this.assertId(request.offerId, 'offer'),
      coverLetter: this.blankToUndefined(request.coverLetter)
    });
  }

  getMyApplications(): Observable<ApplicationResponse[]> {
    return this.api.get<ApplicationResponse[]>(`${this.base}/my`);
  }

  getForOffer(offerId: number): Observable<ApplicationResponse[]> {
    return this.api.get<ApplicationResponse[]>(`${this.base}/offer/${this.assertId(offerId, 'offer')}`);
  }

  getAll(): Observable<ApplicationResponse[]> {
    return this.api.get<ApplicationResponse[]>(this.base);
  }

  updateStatus(id: number, request: UpdateApplicationStatusRequest): Observable<ApplicationResponse> {
    return this.api.patch<ApplicationResponse>(`${this.base}/${this.assertId(id, 'application')}/status`, {
      status: request.status,
      adminNotes: this.blankToUndefined(request.adminNotes)
    });
  }

  private blankToUndefined(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private assertId(id: number, label: string): number {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid ${label} id`);
    }
    return id;
  }
}
