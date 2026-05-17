import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, finalize, of, take, tap } from 'rxjs';

export type SupportedLanguage = 'en' | 'fr';
export type TextDirection = 'ltr' | 'rtl';

export interface LanguageOption {
  code: SupportedLanguage;
  locale: string;
  labelKey: string;
  nativeLabel: string;
  shortLabel: string;
  flagClass: string;
  direction: TextDirection;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly storageKey = 'pgs_language';
  private readonly fallbackLanguage: SupportedLanguage = 'en';

  readonly languages: readonly LanguageOption[] = [
    {
      code: 'en',
      locale: 'en-US',
      labelKey: 'common.language.english',
      nativeLabel: 'English',
      shortLabel: 'EN',
      flagClass: 'flag-gb',
      direction: 'ltr',
    },
    {
      code: 'fr',
      locale: 'fr-FR',
      labelKey: 'common.language.french',
      nativeLabel: 'Francais',
      shortLabel: 'FR',
      flagClass: 'flag-fr',
      direction: 'ltr',
    },
  ];

  readonly currentLanguage = signal<SupportedLanguage>(this.fallbackLanguage);
  readonly isChangingLanguage = signal(false);
  readonly currentLanguageOption = computed(
    () => this.getLanguageOption(this.currentLanguage()) ?? this.languages[0],
  );
  readonly currentDirection = computed(() => this.currentLanguageOption().direction);

  constructor() {
    this.translate.addLangs(this.languages.map((language) => language.code));
    this.translate.setFallbackLang(this.fallbackLanguage);
    this.useLanguage(this.getInitialLanguage()).subscribe();
  }

  useLanguage(language: SupportedLanguage): Observable<unknown> {
    const nextLanguage = this.isSupportedLanguage(language) ? language : this.fallbackLanguage;

    if (nextLanguage === this.currentLanguage() && this.translate.currentLang === nextLanguage) {
      return of(null);
    }

    this.isChangingLanguage.set(true);

    return this.translate.use(nextLanguage).pipe(
      take(1),
      tap(() => {
        this.currentLanguage.set(nextLanguage);
        this.persistLanguage(nextLanguage);
        this.applyDocumentLanguage(nextLanguage);
      }),
      finalize(() => this.isChangingLanguage.set(false)),
    );
  }

  getLanguageOption(language: SupportedLanguage): LanguageOption | undefined {
    return this.languages.find((option) => option.code === language);
  }

  private getInitialLanguage(): SupportedLanguage {
    const stored = this.readStoredLanguage();
    if (stored) {
      return stored;
    }

    const browserLanguage = this.translate.getBrowserLang();
    return this.isSupportedLanguage(browserLanguage) ? browserLanguage : this.fallbackLanguage;
  }

  private readStoredLanguage(): SupportedLanguage | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return this.isSupportedLanguage(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  private persistLanguage(language: SupportedLanguage): void {
    try {
      localStorage.setItem(this.storageKey, language);
    } catch {
      // Storage can be unavailable in private or locked-down browser contexts.
    }
  }

  private applyDocumentLanguage(language: SupportedLanguage): void {
    const option = this.getLanguageOption(language) ?? this.languages[0];
    document.documentElement.lang = option.code;
    document.documentElement.dir = option.direction;
  }

  private isSupportedLanguage(language: string | null | undefined): language is SupportedLanguage {
    return this.languages.some((option) => option.code === language);
  }
}
