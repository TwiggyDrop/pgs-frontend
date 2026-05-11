import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { finalize, filter } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OfferService } from '../../../core/services/offer.service';
import { OfferResponse } from '../../../core/models/offer.models';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule, DatePipe, SlicePipe,
    MatCardModule, MatButtonModule, MatChipsModule,
    MatIconModule, MatProgressSpinnerModule, MatInputModule, MatFormFieldModule
  ],
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.scss'
})
export class OfferListComponent implements OnInit {
  private offerService = inject(OfferService);
  private router = inject(Router);

  offers: OfferResponse[] = [];
  filtered: OfferResponse[] = [];
  loading = !this.offerService.hasCachedOffers;
  error = '';
  searchQuery = '';
  skeletonCards = Array.from({ length: 6 });

  ngOnInit() {
    this.offerService.getAll().pipe(finalize(() => this.loading = false)).subscribe({
      next: (offers) => {
        this.offers = offers;
        this.filtered = offers;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load offers';
      }
    });

    // Refresh when user clicks "Browse Offers" while already on this page
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd && e.urlAfterRedirects === '/offers')
    ).subscribe(() => {
      this.loading = true;
      this.offerService.refreshAll().pipe(finalize(() => this.loading = false)).subscribe({
        next: (offers) => {
          this.offers = offers;
          this.filtered = offers;
          this.searchQuery = '';
        },
        error: (err) => {
          this.error = err.message || 'Failed to load offers';
        }
      });
    });
  }

  filter() {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.offers.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.companyName.toLowerCase().includes(q) ||
      (o.domain?.toLowerCase() ?? '').includes(q) ||
      (o.location?.toLowerCase() ?? '').includes(q)
    );
  }
}
