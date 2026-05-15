import { ChangeDetectorRef } from '@angular/core';
import { Observable, PartialObserver, Subscription } from 'rxjs';

export function subscribeForView<T>(
  source$: Observable<T>,
  changeDetector: ChangeDetectorRef,
  observer: PartialObserver<T>,
): Subscription {
  const scheduleViewUpdate = () => {
    queueMicrotask(() => {
      if (!(changeDetector as { destroyed?: boolean }).destroyed) {
        changeDetector.markForCheck();
      }
    });
  };

  return source$.subscribe({
    next: (value) => {
      observer.next?.(value);
      scheduleViewUpdate();
    },
    error: (error) => {
      observer.error?.(error);
      scheduleViewUpdate();
    },
    complete: () => {
      observer.complete?.();
      scheduleViewUpdate();
    },
  });
}
