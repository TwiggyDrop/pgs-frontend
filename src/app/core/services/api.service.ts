import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, retry, shareReplay, tap, throwError, timeout, timer } from 'rxjs';

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
  private readonly getCache = new Map<string, { expiresAt: number; response$: Observable<unknown> }>();

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    const cached = this.getCache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.response$ as Observable<T>;
    }

    const response$ = this.request<T>('GET', url).pipe(
      catchError((error) => {
        this.getCache.delete(url);
        return throwError(() => error);
      }),
      finalize(() => {
        const current = this.getCache.get(url);
        if (current?.response$ === response$ && current.expiresAt <= Date.now()) {
          this.getCache.delete(url);
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.getCache.set(url, {
      expiresAt: Date.now() + this.cacheTtlMs,
      response$
    });

    return response$;
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
      this.getCache.clear();
      return;
    }

    for (const key of this.getCache.keys()) {
      if (key.startsWith(urlPrefix)) {
        this.getCache.delete(key);
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
