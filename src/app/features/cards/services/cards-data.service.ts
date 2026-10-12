import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Card } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardsDataService {
  private readonly http = inject(HttpClient);

  loadCards(): Observable<Card[]> {
    return this.http.get<Card[]>('/assets/cards/cards.json');
  }
}
