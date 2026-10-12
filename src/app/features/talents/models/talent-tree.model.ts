import { PowerTarget } from "../../../core/models/power-target.model";

export type TalentStatType =
  | 'damage'
  | 'crit_damage_multiplier'
  | 'double_shot_chance'
  | 'crit_chance'
  | 'triple_shot_chance'
  | 'warrior_max_level_increase'
  | 'time_machine_start_level'
  | 'max_pickaxe_limit';


export interface TalentNodeDefinition {
  id: string;
  name: string;
  maxLevel: number;
  statType: TalentStatType;
  target: PowerTarget;
  valuePerLevel: number | null;
  isPercentage: boolean;
}

export interface TalentTreeStage {
  stage: number;
  leftBranch: TalentNodeDefinition[];
  rightBranch: TalentNodeDefinition[];
  junctionNode: TalentNodeDefinition | null;
}

export interface TalentTreeDefinition {
  rootNode: TalentNodeDefinition;
  stages: TalentTreeStage[];
}

export interface TalentTreeStageTopology {
  stage: number;
  leftBranch: string[];
  rightBranch: string[];
  junctionNodeId: string | null;
}

export interface TalentTreeTopology {
  rootNodeId: string;
  stages: TalentTreeStageTopology[];
}



export function flattenTalentTree(tree: TalentTreeDefinition): TalentNodeDefinition[] {
  return [
    tree.rootNode,
    ...tree.stages.flatMap((stage) => [
      ...stage.leftBranch,
      ...stage.rightBranch,
      ...(stage.junctionNode ? [stage.junctionNode] : []),
    ]),
  ];
}
