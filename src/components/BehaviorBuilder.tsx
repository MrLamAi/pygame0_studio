import type { ControlBinding, ControlSlot, GameProject, KeyboardKey } from '../types/game';
import { CONTROL_SLOTS, DEFAULT_BINDINGS } from '../types/game';
import { Icon } from './Icon';

interface BehaviorBuilderProps {
  project: GameProject;
  pythonIdentifiers: Record<string, string>;
  selectedActorId: string | null;
  disabled: boolean;
  onSelectActor: (id: string) => void;
  onControlChange: (binding: ControlBinding) => void;
  onCollisionChange: (patch: Partial<GameProject['collision']>) => void;
  onShowScoreChange: (value: boolean) => void;
  onHighlightControl: (actorId: string, slot: ControlSlot, part: 'condition' | 'action') => void;
  onHighlightCollision: (part: 'condition' | 'score' | 'respawn') => void;
}

const SLOT_TITLES: Record<ControlSlot, string> = { left: 'Left', right: 'Right', up: 'Up', down: 'Down' };
const KEY_OPTIONS: { value: KeyboardKey; label: string }[] = [
  { value: 'left', label: '← Left' }, { value: 'right', label: '→ Right' }, { value: 'up', label: '↑ Up' }, { value: 'down', label: '↓ Down' },
  { value: 'w', label: 'W' }, { value: 'a', label: 'A' }, { value: 's', label: 'S' }, { value: 'd', label: 'D' },
];
const MOVE_OPTIONS = [
  { value: 'x:-1', label: 'x -=' }, { value: 'x:1', label: 'x +=' },
  { value: 'y:-1', label: 'y -=' }, { value: 'y:1', label: 'y +=' },
];

export function BehaviorBuilder({ project, pythonIdentifiers, selectedActorId, disabled, onSelectActor, onControlChange, onCollisionChange, onShowScoreChange, onHighlightControl, onHighlightCollision }: BehaviorBuilderProps) {
  const selectedActor = project.actors.find((actor) => actor.id === selectedActorId) ?? project.actors[0];
  const bindings = selectedActor
    ? CONTROL_SLOTS.map((slot) => project.controls.find((item) => item.actorId === selectedActor.id && item.slot === slot) ?? {
        actorId: selectedActor.id, slot, ...DEFAULT_BINDINGS[slot],
      })
    : [];
  const canCollide = project.actors.length >= 2;
  const collision = project.collision;

  return (
    <section className="behavior-grid" aria-label="Game behaviours">
      <article className="behavior-card panel controls-card">
        <div className="behavior-heading">
          <div className="behavior-heading-left"><span className="behavior-symbol controls-symbol"><Icon name="arrow" size={16} /></span><div><h2>Keyboard logic</h2><p>Each row pairs an <code>if</code> condition with its action</p></div></div>
          {project.actors.length > 0 && <label className="actor-picker"><span>For</span><select aria-label="Controls for actor" value={selectedActor?.id ?? ''} disabled={disabled} onChange={(event) => onSelectActor(event.target.value)}>{project.actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}</select></label>}
        </div>

        {!selectedActor ? (
          <div className="behavior-empty"><Icon name="cursor" size={16} /> Add an actor to build its keyboard controls.</div>
        ) : (
          <div className="control-rows">
            {bindings.map((binding) => {
              const moveValue = `${binding.axis}:${binding.direction}`;
              return (
                <div className={`control-row ${binding.enabled ? 'control-row-enabled' : ''}`} key={binding.slot}>
                  <label className="control-toggle" aria-label={`Enable ${SLOT_TITLES[binding.slot]} control`}>
                    <input type="checkbox" checked={binding.enabled} disabled={disabled} onChange={(event) => { onControlChange({ ...binding, enabled: event.target.checked }); onHighlightControl(binding.actorId, binding.slot, 'condition'); }} />
                  </label>
                  <span className="control-direction"><span className="keycap">{SLOT_TITLES[binding.slot] === 'Left' ? '←' : SLOT_TITLES[binding.slot] === 'Right' ? '→' : SLOT_TITLES[binding.slot] === 'Up' ? '↑' : '↓'}</span><span>{SLOT_TITLES[binding.slot]}</span></span>
                  <code className="logic-keyword">if</code>
                  <select aria-label={`${SLOT_TITLES[binding.slot]} keyboard key`} className="control-select key-select" value={binding.key} disabled={disabled} onChange={(event) => { onControlChange({ ...binding, key: event.target.value as KeyboardKey }); onHighlightControl(binding.actorId, binding.slot, 'condition'); }}>
                    {KEY_OPTIONS.map((key) => <option key={key.value} value={key.value}>{key.label}</option>)}
                  </select>
                  <code className="logic-punctuation">:</code>
                  <span className="logic-indent" aria-hidden="true" />
                  <code className="logic-actor">{pythonIdentifiers[selectedActor.id]}</code>
                  <select aria-label={`${SLOT_TITLES[binding.slot]} movement action`} className="control-select action-select" value={moveValue} disabled={disabled} onChange={(event) => { const [axis, direction] = event.target.value.split(':') as ['x' | 'y', '-1' | '1']; onControlChange({ ...binding, axis, direction: Number(direction) as -1 | 1 }); onHighlightControl(binding.actorId, binding.slot, 'action'); }}>
                    {MOVE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{`.${option.label} ${selectedActor.speed}`}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </article>

      <article className="behavior-card panel collision-card">
        <div className="behavior-heading">
          <div className="behavior-heading-left"><span className="behavior-symbol collision-symbol"><Icon name="sparkle" size={16} /></span><div><h2>Collision logic</h2><p>An <code>if</code> check with indented actions</p></div></div>
          <label className="switch-toggle" title="Enable collision rule"><input aria-label="Enable collision rule" type="checkbox" checked={collision.enabled} disabled={disabled || !canCollide} onChange={(event) => { onCollisionChange({ enabled: event.target.checked }); onHighlightCollision('condition'); }} /><span /></label>
        </div>

        {!canCollide ? (
          <div className="behavior-empty collision-empty"><Icon name="layers" size={16} /> Add a second actor to create a collision rule.</div>
        ) : (
          <div className={`collision-form ${!collision.enabled ? 'collision-muted' : ''}`}>
            <div className="collision-when"><code className="logic-keyword">if</code>
              <select aria-label="First actor in collision" value={collision.actorA || project.actors[0].id} disabled={disabled} onChange={(event) => { onCollisionChange({ actorA: event.target.value }); onHighlightCollision('condition'); }}>{project.actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}</select>
              <code className="collision-method">.colliderect(</code>
              <select aria-label="Second actor in collision" value={collision.actorB || project.actors.find((actor) => actor.id !== project.actors[0].id)!.id} disabled={disabled} onChange={(event) => { onCollisionChange({ actorB: event.target.value }); onHighlightCollision('condition'); }}>{project.actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}</select><code className="logic-punctuation">):</code>
            </div>
            <div className="collision-actions">
              <span className="logic-indent-rail" aria-hidden="true" />
              <label className="score-toggle"><input type="checkbox" checked={project.showScore} disabled={disabled} onChange={(event) => onShowScoreChange(event.target.checked)} /><code>score +=</code></label>
              <input className="score-amount" aria-label="Score increase amount" type="number" min="1" max="100" value={collision.scoreAmount} disabled={disabled || !project.showScore} onChange={(event) => onCollisionChange({ scoreAmount: Math.max(1, Number(event.target.value) || 1) })} onFocus={() => onHighlightCollision('score')} />
            </div>
            <label className="respawn-toggle"><span className="logic-indent-rail" aria-hidden="true" /><input type="checkbox" checked={collision.respawnSecond} disabled={disabled} onChange={(event) => { onCollisionChange({ respawnSecond: event.target.checked }); onHighlightCollision('respawn'); }} /><code>{pythonIdentifiers[collision.actorB] || 'actor'}.pos</code><span>set to a random position</span></label>
          </div>
        )}
      </article>
    </section>
  );
}
