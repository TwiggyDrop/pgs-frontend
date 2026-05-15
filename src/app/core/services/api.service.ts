import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, catchError, finalize, retry, shareReplay, tap, throwError, timeout, timer } from 'rxjs';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly requestTimeoutMs = 15000;
  private readonly cacheTtlMs = 60000;
  private readonly retryableStatuses = new Set([0, 408, 429, 500, 502, 503, 504]);

  /**
   * Stores resolved response values with a TTL.
   * Cache hits return of(value) — always synchronous, always within zone.
   */
  private readonly resultCache = new Map<string, { expiresAt: number; value: unknown }>();

  /**
   * Stores in-flight observables so concurrent subscribers share one HTTP request.
   * Uses refCount:true so the source is cancelled when all subscribers leave.
   */
  private readonly inflightCache = new Map<string, Observable<unknown>>();

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    // 1. Cache hit — synchronous, always inside Angular zone
    const cached = this.resultCache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return of(cached.value as T);
    }

    // 2. In-flight deduplication — share the running request
    const inflight = this.inflightCache.get(url);
    if (inflight) {
      return inflight as Observable<T>;
    }

    // 3. New HTTP request
    const request$ = this.request<T>('GET', url).pipe(
      tap(value => {
        this.resultCache.set(url, { expiresAt: Date.now() + this.cacheTtlMs, value });
      }),
      catchError(error => {
        this.resultCache.delete(url);
        return throwError(() => error);
      }),
      finalize(() => this.inflightCache.delete(url)),
      // refCount:true — source is cancelled when all subscribers unsubscribe.
      // This prevents ghost HTTP requests from a previous navigation polluting
      // the resultCache after the cache has been invalidated by a mutation.
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.inflightCache.set(url, request$);
    return request$;
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.mutate<T>('POST', url, body);
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.mutate<T>('PUT', url, body);
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.mutate<T>('PATCH', url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.mutate<T>('DELETE', url);
  }

  invalidateCache(urlPrefix?: string): void {
    if (!urlPrefix) {
      this.resultCache.clear();
      // Do NOT clear inflightCache — existing subscribers still hold references
      // to those observables. They will complete/error normally. On the next
      // api.get() call the inflight entry will be gone (finalize removes it),
      // so a fresh request fires.
      return;
    }

    for (const key of this.resultCache.keys()) {
      if (key.startsWith(urlPrefix)) {
        this.resultCache.delete(key);
      }
    }
  }

  private request<T>(method: string, url: string, body?: unknown): Observable<T> {
    return this.http.request<T>(method, url, { body }).pipe(
      timeout({ first: this.requestTimeoutMs }),
      retry({
        count: 2,
        delay: (error, retryCount) => {
          if (!this.isRetryable(error)) {
            return throwError(() => error);
          }
          return timer(retryCount * 300);
        }
      }),
      catchError((error) => throwError(() => this.toApiError(error)))
    );
  }

  private mutate<T>(method: string, url: string, body?: unknown): Observable<T> {
    return this.request<T>(method, url, body).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private isRetryable(error: unknown): boolean {
    return (
      (error instanceof HttpErrorResponse && this.retryableStatuses.has(error.status)) ||
      (error instanceof Error && error.name === 'TimeoutError')
    );
  }

  private toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      const details = error.error?.errors ?? error.error;
      const validationMessage = this.formatValidationErrors(error.error?.errors);
      const message =
        validationMessage ||
        error.error?.error ||
        error.error?.message ||
        error.message ||
        'Request failed';

      return new ApiError(message, error.status, details);
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      return new ApiError('The request timed out. Please try again.', 0);
    }

    if (error instanceof Error) {
      return new ApiError(error.message, 0);
    }

    return new ApiError('Unexpected API error', 0, error);
  }

  private formatValidationErrors(errors: unknown): string {
    if (!errors || typeof errors !== 'object') {
      return '';
    }

    return Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
  }
}
