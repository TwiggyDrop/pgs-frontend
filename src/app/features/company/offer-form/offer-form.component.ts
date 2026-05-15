import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfferService } from '../../../core/services/offer.service';
import { CreateOfferRequest } from '../../../core/models/offer.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './offer-form.component.html',
  styleUrl: './offer-form.component.scss',
})
export class OfferFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(OfferService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  editId: number | null = null;
  loading = false;
  saving = false;

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    requiredSkills: [''],
    domain: [''],
    location: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    durationMonths: [null as number | null],
  });

  get isEdit() {
    return this.editId !== null;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = Number(id);
      if (!Number.isInteger(this.editId) || this.editId <= 0) {
        this.router.navigate(['/company/offers']);
        return;
      }
      this.loading = true;
      subscribeForView(
        this.offerService.getById(this.editId).pipe(finalize(() => (this.loading = false))),
        this.cdr,
        {
          next: (offer) => {
            this.form.patchValue({
              title: offer.title,
              description: offer.description,
              requiredSkills: offer.requiredSkills ?? '',
              domain: offer.domain ?? '',
              location: offer.location ?? '',
              startDate: offer.startDate,
              endDate: offer.endDate,
              durationMonths: offer.durationMonths,
            });
          },
          error: () => {
            this.router.navigate(['/company/offers']);
          },
        },
      );
    }
  }

  submit() {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    const value = this.form.getRawValue();
    const req: CreateOfferRequest = {
      title: value.title ?? '',
      description: value.description ?? '',
      requiredSkills: value.requiredSkills || undefined,
      domain: value.domain || undefined,
      location: value.location || undefined,
      startDate: value.startDate ?? '',
      endDate: value.endDate ?? '',
      durationMonths: value.durationMonths ?? undefined,
    };

    const action$ = this.isEdit
      ? this.offerService.update(this.editId!, req)
      : this.offerService.create(req);

    subscribeForView(action$.pipe(finalize(() => (this.saving = false))), this.cdr, {
      next: () => {
        this.snack.open(this.isEdit ? 'Offer updated' : 'Offer created', 'OK', { duration: 3000 });
        this.router.navigate(['/company/offers']);
      },
      error: (err) => {
        this.snack.open(err.message || 'Save failed', 'OK', { duration: 4000 });
      },
    });
  }
}
