import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../models/auth.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'pgs_token';
  private readonly USER_KEY = 'pgs_user';
  private readonly base = `${environment.apiUrl}/auth`;

  private currentUser$ = new BehaviorSubject<AuthResponse | null>(this.loadUser());

  constructor(private api: ApiService) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(`${this.base}/login`, this.trimPayload(request)).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(`${this.base}/register`, this.trimPayload(request)).pipe(
      tap(res => this.saveSession(res))
    );
  }

  me(): Observable<UserResponse> {
    return this.api.get<UserResponse>(`${this.base}/me`).pipe(
      tap(user => this.updateStoredUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): AuthResponse | null {
    return this.currentUser$.getValue();
  }

  currentUser(): Observable<AuthResponse | null> {
    return this.currentUser$.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getUser()?.role === role;
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res));
    this.currentUser$.next(res);
  }

  private updateStoredUser(user: UserResponse): void {
    const current = this.getUser();
    const token = this.getToken();
    if (!current || !token) return;

    const next: AuthResponse = {
      ...current,
      token,
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(next));
    this.currentUser$.next(next);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      return null;
    }
  }

  private trimPayload<T extends object>(payload: T): T {
    return Object.fromEntries(
      Object.entries(payload)
        .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
        .filter(([, value]) => value !== '')
    ) as T;
  }
}
