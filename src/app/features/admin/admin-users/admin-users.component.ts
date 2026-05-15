import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserResponse, Role } from '../../../core/models/auth.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  users: UserResponse[] = [];
  filtered: UserResponse[] = [];
  loading = true;
  error = '';
  selectedRole: Role | '' = '';
  updating: Record<number, boolean> = {};
  columns = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];

  readonly roleOptions: Array<{ value: Role | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'STUDENT', label: 'Students' },
    { value: 'COMPANY', label: 'Companies' },
    { value: 'SUPERVISOR', label: 'Supervisors' },
    { value: 'ADMIN', label: 'Admins' },
  ];

  get currentUserId(): number | undefined {
    return this.auth.getUser()?.userId;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    const obs$ = this.selectedRole
      ? this.adminService.getUsersByRole(this.selectedRole as Role)
      : this.adminService.getAllUsers();

    subscribeForView(obs$.pipe(finalize(() => (this.loading = false))), this.cdr, {
      next: (users) => {
        this.users = users;
        this.filtered = users;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load users';
      },
    });
  }

  toggle(user: UserResponse) {
    if (this.updating[user.id]) return;

    if (user.id === this.currentUserId) {
      this.snack.open('You cannot disable your own admin account while logged in.', 'OK', {
        duration: 3500,
      });
      return;
    }

    this.updating[user.id] = true;
    subscribeForView(
      this.adminService.toggleUser(user.id).pipe(finalize(() => (this.updating[user.id] = false))),
      this.cdr,
      {
        next: (updated) => {
          Object.assign(user, updated);
          this.snack.open(`User ${updated.enabled ? 'enabled' : 'disabled'}`, 'OK', {
            duration: 3000,
          });
        },
        error: (err) => {
          this.snack.open(err.message || 'Failed to update user', 'OK', { duration: 3000 });
        },
      },
    );
  }
}
