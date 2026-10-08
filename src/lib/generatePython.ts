import type { ControlBinding, GameProject } from '../types/game';

export interface PythonLineMap {
  actorDeclarations: Record<string, number>;
  actorDraw: Record<string, number>;
  actorAngles: Record<string, number>;
  actorIdentifiers: Record<string, string>;
  controlConditions: Record<string, number>;
  controlActions: Record<string, number>;
  collisionCondition?: number;
  collisionScore?: number;
  collisionRespawn?: number[];
  sections: Record<CodeSection, number>;
  score?: number;
}

export type CodeSection = 'setup' | 'draw' | 'update';

export interface GeneratedPython {
  code: string;
  lineMap: PythonLineMap;
}

const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while',
  'with', 'yield',
]);

function identifiersFor(project: GameProject): Map<string, string> {
  const names = new Map<string, string>();
  const used = new Set(['random', 'WIDTH', 'HEIGHT', 'score', 'draw', 'update', 'screen', 'keyboard']);

  for (const actor of project.actors) {
    let base = actor.name.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    if (!base) base = 'actor';
    if (/^\d/.test(base)) base = `actor_${base}`;
    if (PYTHON_KEYWORDS.has(base)) base = `${base}_actor`;

    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) candidate = `${base}_${suffix++}`;
    used.add(candidate);
    names.set(actor.id, candidate);
  }

  return names;
}

function keyName(binding: ControlBinding): string {
  return binding.key;
}

export function generatePython(project: GameProject): GeneratedPython {
  const names = identifiersFor(project);
  const lines: string[] = [];
  const lineMap: PythonLineMap = {
    actorDeclarations: {}, actorDraw: {}, actorAngles: {}, actorIdentifiers: {},
    controlConditions: {}, controlActions: {}, sections: { setup: 1, draw: 1, update: 1 },
  };
  const collision = project.collision;
  const collisionEnabled = collision.enabled && collision.actorA !== collision.actorB && names.has(collision.actorA) && names.has(collision.actorB);
  const usesRandom = collisionEnabled && collision.respawnSecond;

  if (usesRandom) lines.push('import random', '');
  lines.push(`WIDTH = ${project.width}`, `HEIGHT = ${project.height}`, '');

  for (const actor of project.actors) {
    const identifier = names.get(actor.id)!;
    lineMap.actorIdentifiers[actor.id] = identifier;
    const declaration = `${identifier} = Actor("${actor.image}", (${Math.round(actor.x)}, ${Math.round(actor.y)}))`;
    lineMap.actorDeclarations[actor.id] = lines.length + 1;
    lines.push(declaration);
    if (actor.angle !== 0) {
      lineMap.actorAngles[actor.id] = lines.length + 1;
      lines.push(`${identifier}.angle = ${Math.round(actor.angle)}`);
    }
    if (!actor.visible) lines.push(`${identifier}_visible = False`);
  }

  if (project.actors.length || project.showScore) lines.push('');
  if (project.showScore) {
    lineMap.score = lines.length + 1;
    lines.push('score = 0', '');
  }

  lineMap.sections.draw = lines.length + 1;
  lines.push('def draw():', '    screen.clear()', '');
  for (const actor of project.actors) {
    const identifier = names.get(actor.id)!;
    if (!actor.visible) {
      const marker = `    if ${identifier}_visible:  # draw ${identifier}`;
      lineMap.actorDraw[actor.id] = lines.length + 1;
      lines.push(marker, `        ${identifier}.draw()`, '');
    } else {
      const marker = `    ${identifier}.draw()`;
      lineMap.actorDraw[actor.id] = lines.length + 1;
      lines.push(marker, '');
    }
  }
  if (project.showScore) lines.push('    screen.draw.text(f"Score: {score}", (20, 20), color="white")', '');

  const enabledControls = project.controls.filter((binding) => binding.enabled && names.has(binding.actorId));
  const hasCollision = collisionEnabled;
  lineMap.sections.update = lines.length + 1;
  lines.push('def update():');
  if (project.showScore && hasCollision) lines.push('    global score', '');

  for (const binding of enabledControls) {
    const identifier = names.get(binding.actorId)!;
    const axis = binding.axis;
    const operator = binding.direction < 0 ? '-=' : '+=';
    const marker = `    if keyboard.${keyName(binding)}:  # ${identifier} ${binding.slot}`;
    const controlKey = `${binding.actorId}:${binding.slot}`;
    lineMap.controlConditions[controlKey] = lines.length + 1;
    lines.push(marker);
    lineMap.controlActions[controlKey] = lines.length + 1;
    lines.push(`        ${identifier}.${axis} ${operator} ${actorSpeed(project, binding.actorId)}`, '');
  }

  if (hasCollision) {
    const first = project.actors.find((actor) => actor.id === collision.actorA)!;
    const second = project.actors.find((actor) => actor.id === collision.actorB)!;
    const firstName = names.get(first.id)!;
    const secondName = names.get(second.id)!;
    const marker = `    if ${firstName}.colliderect(${secondName}):`;
    lineMap.collisionCondition = lines.length + 1;
    lines.push(marker);
    if (project.showScore) {
      lineMap.collisionScore = lines.length + 1;
      lines.push(`        score += ${Math.max(1, Math.round(collision.scoreAmount))}`);
    }
    if (collision.respawnSecond) {
      lineMap.collisionRespawn = [lines.length + 2, lines.length + 3, lines.length + 4, lines.length + 5];
      lines.push(
        '',
        `        ${secondName}.pos = (`,
        '            random.randint(50, WIDTH - 50),',
        '            random.randint(50, HEIGHT - 50)',
        '        )',
      );
    }
    if (!project.showScore && !collision.respawnSecond) lines.push('        pass');
    lines.push('');
  }

  if (!enabledControls.length && !hasCollision) lines.push('    pass');

  while (lines.at(-1) === '') lines.pop();
  return { code: `${lines.join('\n')}\n`, lineMap };
}

function actorSpeed(project: GameProject, actorId: string): number {
  const actor = project.actors.find((entry) => entry.id === actorId);
  return Math.max(0, Math.round(actor?.speed ?? 5));
}

