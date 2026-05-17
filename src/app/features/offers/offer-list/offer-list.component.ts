import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { finalize, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { OfferService } from '../../../core/services/offer.service';
import { ApiService } from '../../../core/services/api.service';
import { OfferResponse } from '../../../core/models/offer.models';
import { subscribeForView } from '../../../shared/utils/view-subscribe';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [TranslatePipe, 
    RouterLink,
    FormsModule,
    DatePipe,
    SlicePipe,
    MatIconModule,
    MatTooltipModule,
    MatRippleModule,
  ],
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.scss',
})
export class OfferListComponent implements OnInit, OnDestroy {
  private offerService = inject(OfferService);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private sub = new Subscription();

  offers: OfferResponse[] = [];
  filtered: OfferResponse[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  skeletonCards = Array.from({ length: 6 });

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  refresh() {
    this.sub.unsubscribe();
    this.sub = new Subscription();
    this.error = '';
    this.searchQuery = '';
    this.loading = true;
    // Bypass cache for manual refresh
    this.apiService.invalidateCache('/api/offers');
    this.load();
  }

  private load() {
    this.sub.add(
      subscribeForView(
        this.offerService.getAll().pipe(finalize(() => (this.loading = false))),
        this.cdr,
        {
          next: (offers) => {
            this.offers = offers;
            this.filtered = offers;
          },
          error: (err) => {
            this.error = err.message || 'Failed to load offers';
          },
        },
      ),
    );
  }

  filter() {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.offers.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.companyName.toLowerCase().includes(q) ||
        (o.domain?.toLowerCase() ?? '').includes(q) ||
        (o.location?.toLowerCase() ?? '').includes(q),
    );
  }
}

