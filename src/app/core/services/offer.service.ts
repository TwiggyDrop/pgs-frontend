import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOfferRequest, OfferResponse } from '../models/offer.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly base = `${environment.apiUrl}/offers`;
  private cachedOffers: OfferResponse[] | null = null;

  constructor(private api: ApiService) {}

  get hasCachedOffers(): boolean { return this.cachedOffers !== null; }

  getAll(): Observable<OfferResponse[]> {
    if (this.cachedOffers !== null) {
      return of(this.cachedOffers);
    }
    return this.api.get<OfferResponse[]>(this.base).pipe(
      tap(offers => this.cachedOffers = offers)
    );
  }

  refreshAll(): Observable<OfferResponse[]> {
    this.cachedOffers = null;
    return this.api.get<OfferResponse[]>(this.base).pipe(
      tap(offers => this.cachedOffers = offers)
    );
  }

  getById(id: number): Observable<OfferResponse> {
    return this.api.get<OfferResponse>(`${this.base}/${this.assertId(id, 'offer')}`);
  }

  getMyOffers(): Observable<OfferResponse[]> {
    return this.api.get<OfferResponse[]>(`${this.base}/my`);
  }

  create(request: CreateOfferRequest): Observable<OfferResponse> {
    return this.api.post<OfferResponse>(this.base, this.toPayload(request));
  }

  update(id: number, request: CreateOfferRequest): Observable<OfferResponse> {
    return this.api.put<OfferResponse>(`${this.base}/${this.assertId(id, 'offer')}`, this.toPayload(request));
  }

  close(id: number): Observable<void> {
    return this.api.patch<void>(`${this.base}/${this.assertId(id, 'offer')}/close`, {});
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${this.assertId(id, 'offer')}`);
  }

  private toPayload(request: CreateOfferRequest): CreateOfferRequest {
    return {
      title: request.title.trim(),
      description: request.description.trim(),
      requiredSkills: this.blankToUndefined(request.requiredSkills),
      domain: this.blankToUndefined(request.domain),
      location: this.blankToUndefined(request.location),
      startDate: request.startDate,
      endDate: request.endDate,
      durationMonths: request.durationMonths ?? undefined
    };
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
