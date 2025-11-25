import { TestBed } from '@angular/core/testing';

import { MonumentService } from './monument.service';

describe('MonumentService', () => {
  let service: MonumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
