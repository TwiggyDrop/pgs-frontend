import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest, Role } from '../../../core/models/auth.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required],
    studentNumber: [''],
    university: [''],
    specialization: [''],
    companyName: [''],
    industry: [''],
    website: [''],
    department: [''],
    phone: [''],
  });

  loading = false;
  error = '';
  hidePassword = true;

  readonly roleOptions = [
    {
      value: 'STUDENT',
      label: 'Student',
      icon: 'person',
      description: 'Find and apply to internships',
    },
    {
      value: 'COMPANY',
      label: 'Company',
      icon: 'business',
      description: 'Post offers and hire interns',
    },
    {
      value: 'SUPERVISOR',
      label: 'Supervisor',
      icon: 'supervisor_account',
      description: 'Oversee and mentor interns',
    },
  ];

  get role() {
    return this.form.get('role')?.value;
  }

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.error = '';

    const v = this.form.getRawValue();
    const request: RegisterRequest = {
      firstName: v.firstName ?? '',
      lastName: v.lastName ?? '',
      email: v.email ?? '',
      password: v.password ?? '',
      role: v.role as Exclude<Role, 'ADMIN'>,
      ...(v.studentNumber && { studentNumber: v.studentNumber }),
      ...(v.university && { university: v.university }),
      ...(v.specialization && { specialization: v.specialization }),
      ...(v.companyName && { companyName: v.companyName }),
      ...(v.industry && { industry: v.industry }),
      ...(v.website && { website: v.website }),
      ...(v.department && { department: v.department }),
      ...(v.phone && { phone: v.phone }),
    };

    subscribeForView(
      this.auth.register(request).pipe(finalize(() => (this.loading = false))),
      this.cdr,
      {
        next: (res) => {
          switch (res.role) {
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
          this.error = err.message || 'Registration failed. Please try again.';
        },
      },
    );
  }
}
