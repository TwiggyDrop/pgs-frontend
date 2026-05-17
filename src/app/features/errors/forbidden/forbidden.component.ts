import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [TranslatePipe, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="forbidden">
      <mat-icon>block</mat-icon>
      <h1>{{ 'forbidden.title' | translate }}</h1>
      <p>{{ 'forbidden.message' | translate }}</p>
      <a mat-flat-button routerLink="/offers">{{ 'forbidden.goToOffers' | translate }}</a>
    </div>
  `,
  styles: [`
    .forbidden {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 16px;
      text-align: center;

      mat-icon { font-size: 64px; width: 64px; height: 64px; color: #c62828; }
      h1 { margin: 0; font-size: 2rem; }
      p { color: rgba(0,0,0,0.6); margin: 0; }
    }
  `],
})
export class ForbiddenComponent {}
