import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OfferService } from '../../../core/services/offer.service';
import { OfferResponse } from '../../../core/models/offer.models';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-company-offers',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatTableModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './company-offers.component.html',
  styleUrl: './company-offers.component.scss'
})
export class CompanyOffersComponent implements OnInit {
  private offerService = inject(OfferService);
  private snack = inject(MatSnackBar);
  private confirmDialog = inject(ConfirmDialogService);

  offers: OfferResponse[] = [];
  loading = true;
  error = '';
  closing: Record<number, boolean> = {};
  deleting: Record<number, boolean> = {};
  columns = ['title', 'status', 'startDate', 'endDate', 'actions'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.offerService.getMyOffers().pipe(finalize(() => this.loading = false)).subscribe({
      next: (offers) => { this.offers = offers; },
      error: (err) => { this.error = err.message || 'Failed to load offers'; }
    });
  }

  close(offer: OfferResponse) {
    if (this.closing[offer.id]) return;

    this.closing[offer.id] = true;
    this.offerService.close(offer.id).pipe(
      finalize(() => this.closing[offer.id] = false)
    ).subscribe({
      next: () => {
        offer.status = 'CLOSED';
        this.snack.open('Offer closed', 'OK', { duration: 3000 });
      },
      error: (err) => this.snack.open(err.message || 'Failed to close', 'OK', { duration: 3000 })
    });
  }

  delete(offer: OfferResponse) {
    if (this.deleting[offer.id]) return;

    this.confirmDialog
      .danger(`Delete "${offer.title}"?`, 'This offer will be permanently removed and cannot be recovered.')
      .subscribe(confirmed => {
        if (!confirmed) return;

        this.deleting[offer.id] = true;
        this.offerService.delete(offer.id).pipe(
          finalize(() => { this.deleting[offer.id] = false; })
        ).subscribe({
          next: () => {
            this.offers = this.offers.filter(o => o.id !== offer.id);
            this.snack.open('Offer deleted', 'OK', { duration: 3000 });
          },
          error: (err) => this.snack.open(err.message || 'Failed to delete', 'OK', { duration: 3000 })
        });
      });
  }
}
