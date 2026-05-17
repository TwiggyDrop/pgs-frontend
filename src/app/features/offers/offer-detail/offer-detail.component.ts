import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfferService } from '../../../core/services/offer.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { OfferResponse } from '../../../core/models/offer.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [TranslatePipe, RouterLink, DatePipe, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './offer-detail.component.html',
  styleUrl: './offer-detail.component.scss',
})
export class OfferDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(OfferService);
  private appService = inject(ApplicationService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  offer: OfferResponse | null = null;
  loading = true;
  applying = false;
  applied = false;
  error = '';

  coverLetterForm = this.fb.group({ coverLetter: [''] });

  get isStudent() {
    return this.auth.getUser()?.role === 'STUDENT';
  }
  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error = 'Offer not found';
      this.loading = false;
      return;
    }

    subscribeForView(
      this.offerService.getById(id).pipe(finalize(() => (this.loading = false))),
      this.cdr,
      {
        next: (offer) => {
          this.offer = offer;
        },
        error: () => {
          this.error = 'Offer not found';
        },
      },
    );
  }

  apply() {
    if (!this.offer || this.applying) return;

    this.applying = true;
    subscribeForView(
      this.appService
        .apply({
          offerId: this.offer.id,
          coverLetter: this.coverLetterForm.value.coverLetter || undefined,
        })
        .pipe(finalize(() => (this.applying = false))),
      this.cdr,
      {
        next: () => {
          this.applied = true;
          this.snack.open('Application submitted!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snack.open(err.message || 'Failed to apply', 'Close', { duration: 4000 });
        },
      },
    );
  }
}

