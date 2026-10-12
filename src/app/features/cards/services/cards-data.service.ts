import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Card } from '../models/card.model';
import { BaseHrefService } from '@core/services/base-href.service';

@Injectable({ providedIn: 'root' })
export class CardsDataService {
  private readonly http = inject(HttpClient);
  private baseHref = inject(BaseHrefService);

  loadCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseHref.getBaseHref()}assets/cards/cards.json`);
  }
}
