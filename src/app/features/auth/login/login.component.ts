import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';
  hidePassword = true;

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.error = '';
    const value = this.form.getRawValue();
    const request: LoginRequest = {
      email: value.email ?? '',
      password: value.password ?? '',
    };

    subscribeForView(
      this.auth.login(request).pipe(finalize(() => (this.loading = false))),
      this.cdr,
      {
        next: (res) => {
          switch (res.role) {
            case 'ADMIN':
              this.router.navigate(['/admin/dashboard']);
              break;
            case 'COMPANY':
              this.router.navigate(['/company/offers']);
              break;
            case 'STUDENT':
              this.router.navigate(['/student/applications']);
              break;
            case 'SUPERVISOR':
              this.router.navigate(['/supervisor/internships']);
              break;
            default:
              this.router.navigate(['/offers']);
          }
        },
        error: (err) => {
          this.error = err.message || 'Login failed. Check your credentials.';
        },
      },
    );
  }
}
