import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state" [attr.aria-label]="title">
      <mat-icon aria-hidden="true">{{ icon }}</mat-icon>
      <p class="empty-title">{{ title }}</p>
      @if (description) {
        <p class="empty-description">{{ description }}</p>
      }
      <ng-content />
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() description?: string;
}

