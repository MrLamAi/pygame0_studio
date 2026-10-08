import type { GameActor, GameProject } from '../types/game';
import { createBindings } from '../types/game';

function actor(id: string, name: string, image: GameActor['image'], x: number, y: number): GameActor {
  return { id, name, image, x, y, speed: 5, angle: 0, visible: true };
}

export function createSampleProject(): GameProject {
  const player = actor('sample-player', 'player', 'spaceship', 155, 330);
  const coin = actor('sample-coin', 'coin', 'coin', 510, 285);

  return {
    name: 'Catch the Coin',
    width: 800,
    height: 600,
    actors: [player, coin],
    controls: createBindings(player.id, true),
    collision: {
      enabled: true,
      actorA: player.id,
      actorB: coin.id,
      scoreAmount: 1,
      respawnSecond: true,
    },
    showScore: true,
  };
}

export function createEmptyProject(): GameProject {
  return {
    name: 'Untitled game',
    width: 800,
    height: 600,
    actors: [],
    controls: [],
    collision: { enabled: false, actorA: '', actorB: '', scoreAmount: 1, respawnSecond: true },
    showScore: false,
  };
}

export function loadSavedProject(): GameProject | null {
  try {
    const raw = localStorage.getItem('pygame-zero-visual-studio:project:v1');
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<GameProject>;
    if (
      typeof value.name !== 'string' ||
      !Array.isArray(value.actors) ||
      !Array.isArray(value.controls) ||
      typeof value.width !== 'number' ||
      typeof value.height !== 'number' ||
      typeof value.collision !== 'object' ||
      value.collision === null ||
      typeof value.showScore !== 'boolean'
    ) return null;
    return value as GameProject;
  } catch {
    return null;
  }
}

