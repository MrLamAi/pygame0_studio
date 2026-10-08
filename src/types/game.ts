export type ActorImage = 'spaceship' | 'alien' | 'coin' | 'ball';
export type ControlSlot = 'left' | 'right' | 'up' | 'down';
export type KeyboardKey = ControlSlot | 'w' | 'a' | 's' | 'd';
export type MovementAxis = 'x' | 'y';

export interface GameActor {
  id: string;
  name: string;
  image: ActorImage;
  x: number;
  y: number;
  speed: number;
  angle: number;
  visible: boolean;
}

export interface ControlBinding {
  actorId: string;
  slot: ControlSlot;
  key: KeyboardKey;
  enabled: boolean;
  axis: MovementAxis;
  direction: -1 | 1;
}

export interface CollisionRule {
  enabled: boolean;
  actorA: string;
  actorB: string;
  scoreAmount: number;
  respawnSecond: boolean;
}

export interface GameProject {
  name: string;
  width: number;
  height: number;
  actors: GameActor[];
  controls: ControlBinding[];
  collision: CollisionRule;
  showScore: boolean;
}

export const ACTOR_IMAGES: ActorImage[] = ['spaceship', 'alien', 'coin', 'ball'];

export const CONTROL_SLOTS: ControlSlot[] = ['left', 'right', 'up', 'down'];

export const DEFAULT_BINDINGS: Record<ControlSlot, Omit<ControlBinding, 'actorId' | 'slot'>> = {
  left: { key: 'left', enabled: false, axis: 'x', direction: -1 },
  right: { key: 'right', enabled: false, axis: 'x', direction: 1 },
  up: { key: 'up', enabled: false, axis: 'y', direction: -1 },
  down: { key: 'down', enabled: false, axis: 'y', direction: 1 },
};

export function createBindings(actorId: string, enabled = false): ControlBinding[] {
  return CONTROL_SLOTS.map((slot) => ({
    actorId,
    slot,
    ...DEFAULT_BINDINGS[slot],
    enabled,
  }));
}
