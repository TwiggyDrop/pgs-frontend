import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForbiddenComponent } from './features/errors/forbidden/forbidden.component';
import { ShellComponent } from './shared/shell/shell.component';

import { OfferListComponent } from './features/offers/offer-list/offer-list.component';
import { OfferDetailComponent } from './features/offers/offer-detail/offer-detail.component';

import { CompanyOffersComponent } from './features/company/company-offers/company-offers.component';
import { OfferFormComponent } from './features/company/offer-form/offer-form.component';
import { CompanyApplicationsComponent } from './features/company/company-applications/company-applications.component';

import { StudentApplicationsComponent } from './features/student/student-applications/student-applications.component';
import { StudentInternshipsComponent } from './features/student/student-internships/student-internships.component';

import { SupervisorInternshipsComponent } from './features/supervisor/supervisor-internships/supervisor-internships.component';

import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './features/admin/admin-users/admin-users.component';
import { AdminApplicationsComponent } from './features/admin/admin-applications/admin-applications.component';
import { AdminInternshipsComponent } from './features/admin/admin-internships/admin-internships.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '403', component: ForbiddenComponent },

  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'offers', pathMatch: 'full' },

      // Public
      { path: 'offers', component: OfferListComponent },
      { path: 'offers/:id', component: OfferDetailComponent },

      // Company
      { path: 'company/offers', component: CompanyOffersComponent, canActivate: [roleGuard('COMPANY')] },
      { path: 'company/offers/new', component: OfferFormComponent, canActivate: [roleGuard('COMPANY')] },
      { path: 'company/offers/:id/edit', component: OfferFormComponent, canActivate: [roleGuard('COMPANY')] },
      { path: 'company/applications/:offerId', component: CompanyApplicationsComponent, canActivate: [roleGuard('COMPANY')] },

      // Student
      { path: 'student/applications', component: StudentApplicationsComponent, canActivate: [roleGuard('STUDENT')] },
      { path: 'student/internships', component: StudentInternshipsComponent, canActivate: [roleGuard('STUDENT')] },

      // Supervisor
      { path: 'supervisor/internships', component: SupervisorInternshipsComponent, canActivate: [roleGuard('SUPERVISOR')] },

      // Admin
      { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
      { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'admin/users', component: AdminUsersComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'admin/applications', component: AdminApplicationsComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'admin/internships', component: AdminInternshipsComponent, canActivate: [roleGuard('ADMIN')] },
    ]
  },

  { path: '**', redirectTo: '/offers' }
];
