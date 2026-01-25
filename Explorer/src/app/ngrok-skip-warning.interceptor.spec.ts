import { TestBed } from '@angular/core/testing';

import { NgrokSkipWarningInterceptor } from './ngrok-skip-warning.interceptor';

describe('NgrokSkipWarningInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      NgrokSkipWarningInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: NgrokSkipWarningInterceptor = TestBed.inject(NgrokSkipWarningInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
