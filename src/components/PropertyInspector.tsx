import type { ActorImage, GameActor } from '../types/game';
import { ACTOR_IMAGES } from '../types/game';
import { Icon } from './Icon';

interface PropertyInspectorProps {
  actor: GameActor | null;
  disabled: boolean;
  onChange: (patch: Partial<GameActor>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const IMAGE_NAMES: Record<ActorImage, string> = {
  spaceship: 'Spaceship', alien: 'Alien', coin: 'Coin', ball: 'Ball',
};

export function PropertyInspector({ actor, disabled, onChange, onDuplicate, onDelete }: PropertyInspectorProps) {
  if (!actor) {
    return (
      <aside className="inspector inspector-empty">
        <span className="inspector-placeholder"><Icon name="cursor" size={20} /></span>
        <strong>Select an actor</strong>
        <span>Choose an object to edit its properties.</span>
      </aside>
    );
  }

  const numeric = (key: 'x' | 'y' | 'speed' | 'angle', value: string) => {
    if (value.trim() === '') return;
    const number = Number(value);
    if (Number.isFinite(number)) onChange({ [key]: Math.round(number) });
  };

  return (
    <aside className={`inspector ${disabled ? 'inspector-disabled' : ''}`} aria-label={`${actor.name} properties`}>
      <div className="inspector-title-row">
        <div><p className="eyebrow">SELECTED OBJECT</p><h3>Properties</h3></div>
        <span className="selected-badge">Actor</span>
      </div>

      <label className="field-label" htmlFor="actor-name">Name</label>
      <input id="actor-name" className="text-field" value={actor.name} disabled={disabled} maxLength={24} onChange={(event) => onChange({ name: event.target.value })} />

      <label className="field-label" htmlFor="actor-image">Image</label>
      <select id="actor-image" className="select-field" value={actor.image} disabled={disabled} onChange={(event) => onChange({ image: event.target.value as ActorImage })}>
        {ACTOR_IMAGES.map((image) => <option key={image} value={image}>{IMAGE_NAMES[image]}</option>)}
      </select>

      <div className="field-label position-label">Position <span>pixels</span></div>
      <div className="position-fields">
        <label className="number-field"><span>X</span><input aria-label="X position" type="number" min="0" max="800" value={actor.x} disabled={disabled} onChange={(event) => numeric('x', event.target.value)} /></label>
        <label className="number-field"><span>Y</span><input aria-label="Y position" type="number" min="0" max="600" value={actor.y} disabled={disabled} onChange={(event) => numeric('y', event.target.value)} /></label>
      </div>

      <label className="field-label" htmlFor="actor-speed">Movement speed <span className="unit-label">px / key press</span></label>
      <input id="actor-speed" className="text-field short-number" type="number" min="1" max="30" value={actor.speed} disabled={disabled} onChange={(event) => numeric('speed', event.target.value)} />

      <label className="field-label" htmlFor="actor-angle">Angle <span className="unit-label">degrees</span></label>
      <input id="actor-angle" className="text-field short-number" type="number" min="-360" max="360" value={actor.angle} disabled={disabled} onChange={(event) => numeric('angle', event.target.value)} />

      <label className="visibility-row">
        <span><strong>Visible</strong><small>Show in the game</small></span>
        <input type="checkbox" checked={actor.visible} disabled={disabled} onChange={(event) => onChange({ visible: event.target.checked })} />
      </label>

      <div className="inspector-actions">
        <button className="secondary-button small-button" type="button" onClick={onDuplicate} disabled={disabled} title="Duplicate actor"><Icon name="duplicate" size={15} /> Duplicate</button>
        <button className="danger-button small-button" type="button" onClick={onDelete} disabled={disabled} title="Delete actor"><Icon name="trash" size={15} /> Delete</button>
      </div>
    </aside>
  );
}
