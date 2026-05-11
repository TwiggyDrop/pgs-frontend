import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, UserResponse } from '../models/auth.models';
import { StatsResponse } from '../models/admin.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/admin`;

  constructor(private api: ApiService) {}

  getAllUsers(): Observable<UserResponse[]> {
    return this.api.get<UserResponse[]>(`${this.base}/users`);
  }

  getUsersByRole(role: Role): Observable<UserResponse[]> {
    return this.api.get<UserResponse[]>(`${this.base}/users/role/${role}`);
  }

  toggleUser(id: number): Observable<UserResponse> {
    return this.api.patch<UserResponse>(`${this.base}/users/${this.assertId(id, 'user')}/toggle`, {});
  }

  getStats(): Observable<StatsResponse> {
    return this.api.get<StatsResponse>(`${this.base}/stats`);
  }

  private assertId(id: number, label: string): number {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid ${label} id`);
    }
    return id;
  }
}
