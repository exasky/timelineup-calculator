import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';

import { BaseHrefService } from '@core/services/base-href.service';
import {
  TalentNodeDefinition,
  TalentTreeDefinition,
  TalentTreeTopology
} from '../models/talent-tree.model';

@Service()
export class TalentsDataService {
  private readonly http = inject(HttpClient);
  private baseHref = inject(BaseHrefService);

  readonly tree = toSignal(
    forkJoin({
      topology: this.http.get<TalentTreeTopology>(`${this.baseHref.getBaseHref()}assets/talents/talents.json`),
      definitions: this.http.get<TalentNodeDefinition[]>(`${this.baseHref.getBaseHref()}assets/talents/talent_def.json`),
    }).pipe(
      map(({ topology, definitions }) => this.resolveTalentTree(topology, definitions)),
      catchError(() => of(null)),
    ),
    { initialValue: null },
  );

  private resolveTalentTree(
    topology: TalentTreeTopology,
    definitions: readonly TalentNodeDefinition[],
  ): TalentTreeDefinition {
    const definitionsById = new Map(definitions.map((node) => [node.id, node]));
    const resolveNode = (id: string): TalentNodeDefinition => {
      const node = definitionsById.get(id);
      if (!node) {
        throw new Error(`Talent graph references missing definition: ${id}`);
      }
      return node;
    };

    return {
      rootNode: resolveNode(topology.rootNodeId),
      stages: topology.stages.map((stage) => ({
        stage: stage.stage,
        leftBranch: stage.leftBranch.map(resolveNode),
        rightBranch: stage.rightBranch.map(resolveNode),
        junctionNode: stage.junctionNodeId ? resolveNode(stage.junctionNodeId) : null,
      })),
    };
  }
}
