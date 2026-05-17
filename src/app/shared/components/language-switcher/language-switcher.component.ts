import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  QueryList,
  ViewChildren,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LanguageOption,
  LanguageService,
  SupportedLanguage,
} from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [MatIconModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="language-shell" [class.compact]="compact" [class.open]="isOpen()">
      <button
        class="language-trigger"
        type="button"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="panelId"
        [attr.aria-label]="'common.language.change' | translate"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)">
        <span class="flag-orb" [class]="currentLanguage().flagClass" aria-hidden="true"></span>
        <span class="trigger-copy">
          <span class="trigger-label">{{ currentLanguage().nativeLabel }}</span>
        </span>
        <span class="trigger-code">{{ currentLanguage().shortLabel }}</span>
        <mat-icon class="trigger-chevron" aria-hidden="true">expand_more</mat-icon>
      </button>

      @if (isOpen()) {
        <div
          class="language-panel"
          [id]="panelId"
          role="listbox"
          [attr.aria-label]="'common.language.select' | translate"
          [attr.aria-activedescendant]="activeOptionId()"
          (keydown)="onPanelKeydown($event)">
          <div class="panel-header">
            <span>{{ 'common.language.title' | translate }}</span>
          </div>

          @for (option of language.languages; track option.code; let index = $index) {
            <button
              #languageOption
              class="language-option"
              type="button"
              role="option"
              [id]="optionId(option.code)"
              [class.active]="option.code === language.currentLanguage()"
              [class.focused]="index === activeIndex()"
              [attr.aria-selected]="option.code === language.currentLanguage()"
              (click)="selectLanguage(option)"
              (mouseenter)="activeIndex.set(index)">
              <span class="flag-orb" [class]="option.flagClass" aria-hidden="true"></span>
              <span class="option-copy">
                <span class="option-name">{{ option.nativeLabel }}</span>
              </span>
              @if (option.code === language.currentLanguage()) {
                <span class="active-check" aria-hidden="true">
                  <mat-icon>check</mat-icon>
                </span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-flex; position: relative; z-index: var(--z-dropdown); }
    .language-shell { position: relative; }
    button { font: inherit; }

    .language-trigger {
      display: inline-grid;
      grid-template-columns: auto minmax(0, 1fr) auto auto;
      align-items: center;
      gap: var(--space-2);
      min-width: 164px;
      height: 40px;
      padding: var(--space-1) var(--space-2) var(--space-1) var(--space-1);
      border: 1px solid rgb(148 163 184 / 0.28);
      border-radius: var(--radius-full);
      background: var(--surface-base);
      box-shadow: var(--shadow-xs);
      color: var(--text-primary);
      cursor: pointer;
      transition: transform var(--duration-normal) var(--ease-default), box-shadow var(--duration-normal), border-color var(--duration-normal);
    }

    .language-trigger:hover,
    .open .language-trigger {
      border-color: rgb(37 99 235 / 0.34);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .language-trigger:focus-visible,
    .language-option:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus), var(--shadow-sm);
    }

    .flag-orb {
      width: 28px;
      height: 28px;
      overflow: hidden;
      border: 1px solid rgb(15 23 42 / 0.10);
      border-radius: var(--radius-full);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.55), var(--shadow-xs);
    }

    .flag-gb { background: #012169; }
    .flag-fr { background: linear-gradient(90deg, #0055a4 33%, #fff 33% 66%, #ef4135 66%); }

    .trigger-copy,
    .option-copy { display: flex; min-width: 0; flex-direction: column; align-items: flex-start; }

    .trigger-label,
    .option-name {
      overflow: hidden;
      max-width: 100%;
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-weight: var(--font-bold);
      line-height: var(--leading-tight);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .trigger-code {
      padding: 3px 7px;
      border-radius: var(--radius-full);
      background: var(--color-primary-subtle);
      color: var(--color-primary-text);
      font-size: var(--text-2xs);
      font-weight: var(--font-bold);
    }

    .trigger-chevron { width: 18px; height: 18px; color: var(--text-tertiary); font-size: 18px; transition: transform var(--duration-normal) var(--ease-spring); }
    .open .trigger-chevron { transform: rotate(180deg); }

    .language-panel {
      position: absolute;
      inset-inline-end: 0;
      top: calc(100% + var(--space-2));
      width: min(320px, calc(100vw - 32px));
      padding: var(--space-2);
      border: 1px solid rgb(148 163 184 / 0.22);
      border-radius: var(--radius-xl);
      background: var(--surface-overlay);
      box-shadow: var(--shadow-2xl);
      animation: menu-in var(--duration-slow) var(--ease-spring);
    }

    .panel-header { display: flex; flex-direction: column; gap: 2px; padding: var(--space-2) var(--space-2-5); color: var(--text-primary); font-size: var(--text-sm); font-weight: var(--font-bold); }
    .language-option {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      min-height: 54px;
      padding: var(--space-2);
      border: 1px solid transparent;
      border-radius: var(--radius-lg);
      background: transparent;
      cursor: pointer;
      text-align: start;
      transition: background var(--duration-normal), border-color var(--duration-normal), transform var(--duration-normal) var(--ease-default);
    }

    .language-option:hover,
    .language-option.focused { background: rgb(37 99 235 / 0.06); border-color: rgb(37 99 235 / 0.14); }
    .language-option.active { background: linear-gradient(135deg, var(--brand-50), rgb(255 255 255 / 0.82)); border-color: var(--color-primary-border); }

    .active-check { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: var(--radius-full); background: var(--color-primary); color: var(--text-inverse); }

    .active-check mat-icon { width: 16px; height: 16px; font-size: 16px; }

    .compact .language-trigger {
      min-width: 40px;
      width: 40px;
      padding: var(--space-1);
      grid-template-columns: auto;
    }

    .compact .trigger-copy,
    .compact .trigger-code,
    .compact .trigger-chevron { display: none; }

    @keyframes menu-in {
      from { opacity: 0; transform: translateY(-6px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @media (max-width: 640px) {
      :host { position: static; }
      .language-trigger { min-width: 40px; width: 40px; padding: var(--space-1); grid-template-columns: auto; }
      .trigger-copy,
      .trigger-code,
      .trigger-chevron { display: none; }
      .language-panel { position: fixed; inset: auto var(--space-4) var(--space-4); width: auto; border-radius: var(--radius-2xl); }
    }

  `],
})
export class LanguageSwitcherComponent {
  @Input() compact = false;
  @ViewChildren('languageOption') private optionElements?: QueryList<ElementRef<HTMLButtonElement>>;

  readonly language = inject(LanguageService);
  readonly isOpen = signal(false);
  readonly activeIndex = signal(0);
  readonly currentLanguage = computed(() => this.language.currentLanguageOption());
  readonly panelId = `language-panel-${Math.random().toString(36).slice(2)}`;

  private readonly host = inject(ElementRef<HTMLElement>);

  readonly activeOptionId = computed(() => {
    const option = this.language.languages[this.activeIndex()];
    return option ? this.optionId(option.code) : null;
  });

  @HostListener('document:click', ['$event'])
  closeFromOutside(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    this.activeIndex.set(this.currentLanguageIndex());
    this.isOpen.set(true);
    this.focusActiveOption();
  }

  close(): void {
    this.isOpen.set(false);
  }

  selectLanguage(option: LanguageOption): void {
    this.language.useLanguage(option.code).subscribe(() => this.close());
  }

  optionId(language: SupportedLanguage): string {
    return `${this.panelId}-${language}`;
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    const lastIndex = this.language.languages.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set(this.activeIndex() >= lastIndex ? 0 : this.activeIndex() + 1);
        this.focusActiveOption();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(this.activeIndex() <= 0 ? lastIndex : this.activeIndex() - 1);
        this.focusActiveOption();
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        this.focusActiveOption();
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(lastIndex);
        this.focusActiveOption();
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectLanguage(this.language.languages[this.activeIndex()]);
        break;
    }
  }

  private currentLanguageIndex(): number {
    return Math.max(
      0,
      this.language.languages.findIndex((option) => option.code === this.language.currentLanguage()),
    );
  }

  private focusActiveOption(): void {
    setTimeout(() => this.optionElements?.get(this.activeIndex())?.nativeElement.focus());
  }
}
