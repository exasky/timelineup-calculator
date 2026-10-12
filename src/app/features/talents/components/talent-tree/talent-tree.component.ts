import { Component, computed, inject, signal } from '@angular/core';

import { BuildStateService } from '../../../../core/services/build-state.service';
import { TalentStatCalculatorService } from '../../calculators/talent-stat-calculator.service';
import { TalentsDataService } from '../../services/talents-data.service';
import { flattenTalentTree, TalentNodeDefinition } from '../../models/talent-tree.model';

interface TalentNodePosition {
  node: TalentNodeDefinition;
  x: number;
  y: number;
  stage: number;
  kind: 'root' | 'branch' | 'junction';
}

interface TalentTreeLink {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface TalentTreeLayout {
  nodes: TalentNodePosition[];
  links: TalentTreeLink[];
  height: number;
}

const ROOT_TOP = 48;
const BRANCH_ROW_GAP = 110;
const STAGE_HEIGHT = BRANCH_ROW_GAP * 4;

@Component({
  selector: 'app-talent-tree',
  templateUrl: './talent-tree.component.html',
  styleUrl: './talent-tree.component.scss',
})
export class TalentTreeComponent {
  private readonly buildState = inject(BuildStateService);
  private readonly talentsData = inject(TalentsDataService);
  private readonly talentCalculator = inject(TalentStatCalculatorService);

  readonly tree = this.talentsData.tree;
  readonly selectedNodeId = signal('global_damage_1');
  readonly layout = computed<TalentTreeLayout>(() => {
    const tree = this.tree();
    if (!tree) {
      return { nodes: [], links: [], height: 0 };
    }

    const nodes: TalentNodePosition[] = [{
      node: tree.rootNode,
      x: 50,
      y: ROOT_TOP,
      stage: 0,
      kind: 'root',
    }];
    const links: TalentTreeLink[] = [];

    tree.stages.forEach((stage, index) => {
      const rootY = ROOT_TOP + index * STAGE_HEIGHT;
      const branchY = (branchIndex: number): number => rootY + (branchIndex + 1) * BRANCH_ROW_GAP;

      for (const [side, branch, x] of [
        ['left', stage.leftBranch, 24],
        ['right', stage.rightBranch, 76],
      ] as const) {
        branch.forEach((node, branchIndex) => {
          const y = branchY(branchIndex);
          nodes.push({ node, x, y, stage: stage.stage, kind: 'branch' });
          if (branchIndex === 0) {
            links.push({ id: `${stage.stage}-${side}-root`, x1: 50, y1: rootY, x2: x, y2: y });
          } else {
            links.push({
              id: `${stage.stage}-${side}-${branchIndex}`,
              x1: x,
              y1: branchY(branchIndex - 1),
              x2: x,
              y2: y,
            });
          }
        });
      }

      if (stage.junctionNode) {
        const junctionY = rootY + STAGE_HEIGHT;
        nodes.push({ node: stage.junctionNode, x: 50, y: junctionY, stage: stage.stage, kind: 'junction' });

        for (const [side, branch, x] of [
          ['left', stage.leftBranch, 24],
          ['right', stage.rightBranch, 76],
        ] as const) {
          const lastBranchIndex = branch.length - 1;
          if (lastBranchIndex >= 0) {
            links.push({
              id: `${stage.stage}-${side}-junction`,
              x1: x,
              y1: branchY(lastBranchIndex),
              x2: 50,
              y2: junctionY,
            });
          }
        }
      }
    });

    return {
      nodes,
      links,
      height: ROOT_TOP + tree.stages.length * STAGE_HEIGHT + 48,
    };
  });
  readonly nodes = computed(() => this.layout().nodes);
  readonly links = computed(() => this.layout().links);
  readonly treeHeight = computed(() => this.layout().height);
  readonly selectedNode = computed(
    () => this.nodes().find((entry) => entry.node.id === this.selectedNodeId()) ?? this.nodes()[0] ?? null,
  );
  readonly selectedLevel = computed(() => {
    const selected = this.selectedNode();
    return selected ? this.buildState.levels()[selected.node.id] ?? 0 : 0;
  });
  readonly ranksAssigned = computed(() =>
    this.nodes().reduce((total, entry) => total + (this.buildState.levels()[entry.node.id] ?? 0), 0),
  );
  readonly selectedNodeBonus = computed(() => {
    const selected = this.selectedNode();
    return selected
      ? this.talentCalculator.calculateNodeBonus(selected.node, this.selectedLevel())
      : null;
  });
  readonly talentBonuses = computed(() => {
    const tree = this.tree();
    return tree
      ? this.talentCalculator.calculateBonuses(
        flattenTalentTree(tree),
        this.buildState.levels(),
      )
      : [];
  });

  levelFor(node: TalentNodeDefinition): number {
    return this.buildState.levels()[node.id] ?? 0;
  }

  symbolFor(name: string): string {
    return name;
    return name
      .split(/\s+/)
      .map((word) => /^\d+$/.test(word) ? word : word[0] ?? '')
      .join('')
      .slice(0, 4)
      .toUpperCase();
  }

  formatTalentValue(value: number, isPercentage: boolean): string {
    const formattedValue = Number(value.toFixed(2)).toLocaleString();
    return `${isPercentage ? '+' : ''}${formattedValue}${isPercentage ? '%' : ''}`;
  }

  statLabel(statType: string): string {
    return statType.replaceAll('_', ' ');
  }

  selectNode(entry: TalentNodePosition): void {
    this.selectedNodeId.set(entry.node.id);
  }

  adjustSelectedLevel(delta: number): void {
    const selected = this.selectedNode();
    if (selected) {
      this.buildState.setLevel(selected.node.id, this.selectedLevel() + delta, selected.node.maxLevel);
    }
  }
}
