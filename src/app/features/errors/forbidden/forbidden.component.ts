import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="forbidden">
      <mat-icon>block</mat-icon>
      <h1>403 — Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <a mat-flat-button routerLink="/offers">Go to Offers</a>
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
  `]
})
export class ForbiddenComponent {}
