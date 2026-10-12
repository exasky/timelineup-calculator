import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';

import {
  resolveTalentTree,
  TalentNodeDefinition,
  TalentTreeDefinition,
  TalentTreeTopology,
} from '../models/talent-tree.model';

@Injectable({ providedIn: 'root' })
export class TalentsDataService {
  private readonly http = inject(HttpClient);

  readonly tree = toSignal(
    forkJoin({
      topology: this.http.get<TalentTreeTopology>('/assets/talents/talents.json'),
      definitions: this.http.get<TalentNodeDefinition[]>('/assets/talents/talent_def.json'),
    }).pipe(
      map(({ topology, definitions }) => resolveTalentTree(topology, definitions)),
      catchError(() => of(null)),
    ),
    { initialValue: null },
  );
}
