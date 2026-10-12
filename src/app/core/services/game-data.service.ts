import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Era, Upgrade } from '../models/timelineup.model';
import { BaseHrefService } from './base-href.service';

@Injectable({ providedIn: 'root' })
export class GameDataService {
  private readonly http = inject(HttpClient);
  private baseHref = inject(BaseHrefService);

  loadUpgrades(): Observable<Upgrade[]> {
    return this.http.get<Upgrade[]>(`${this.baseHref.getBaseHref()}/assets/data/upgrades.json`);
  }

  loadEras(): Observable<Era[]> {
    return this.http.get<Era[]>(`${this.baseHref.getBaseHref()}/assets/data/eras.json`);
  }

  calculateUpgradeCost(upgrade: Upgrade, fromLevel: number, toLevel: number): number {
    let totalCost = 0;

    for (let level = fromLevel; level < toLevel; level += 1) {
      totalCost += upgrade.baseCost * upgrade.costMultiplier ** level;
    }

    return totalCost;
  }
}
