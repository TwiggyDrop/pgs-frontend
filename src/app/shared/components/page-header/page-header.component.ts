import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="page-header-left">
        @if (eyebrow) {
          <p class="page-eyebrow">{{ eyebrow }}</p>
        }
        <h1>{{ title }}</h1>
        @if (count !== null && count !== undefined) {
          <p class="page-count">{{ count }} {{ count === 1 ? singular : plural }}</p>
        }
      </div>
      <div class="page-header-actions">
        <ng-content />
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() eyebrow?: string;
  @Input() count?: number | null;
  @Input() singular = 'item';
  @Input() plural = 'items';
}

