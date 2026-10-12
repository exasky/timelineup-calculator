import { GameItem } from '../models/game-item.interface';
import { BuildStateService } from './build-state.service';

describe('BuildStateService', () => {
  const items: GameItem[] = [
    { id: 'card-a', name: 'Card A', level: 1, maxLevel: 20, basePower: 0, powerScaling: 1 },
    { id: 'card-b', name: 'Card B', level: 1, maxLevel: 20, basePower: 0, powerScaling: 1 },
  ];

  beforeEach(() => {
    window.localStorage.removeItem('timelineup-build');
    window.location.hash = '#/';
  });

  it('does not re-enable disabled items when existing items are initialized again', () => {
    const state = new BuildStateService();
    state.initializeItems(items);
    state.toggleItem('card-a');

    state.setLevel('card-b', 8, 20);
    state.initializeItems(items);

    expect(state.enabledItemIds().has('card-a')).toBe(false);
    expect(state.enabledItemIds().has('card-b')).toBe(true);
    expect(state.levels()['card-b']).toBe(8);
  });

  it('accepts a level before catalog initialization using the supplied max level', () => {
    const state = new BuildStateService();

    state.setLevel('card-a', 7, 200);

    expect(state.levels()['card-a']).toBe(7);
    expect(state.maxLevels()['card-a']).toBe(200);
  });
});
