import type { GameActor } from '../types/game';
import { ActorArt } from './ActorArt';
import { Icon } from './Icon';

interface ObjectPanelProps {
  actors: GameActor[];
  selectedActorId: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function ObjectPanel({ actors, selectedActorId, disabled, onSelect, onAdd }: ObjectPanelProps) {
  return (
    <aside className="object-panel panel" aria-labelledby="objects-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">YOUR GAME</p>
          <h2 id="objects-heading">Objects <span className="count-pill">{actors.length}</span></h2>
        </div>
        <button className="icon-button subtle" type="button" aria-label="Add actor" title="Add actor" disabled={disabled} onClick={onAdd}>
          <Icon name="plus" size={19} />
        </button>
      </div>

      <div className="scene-tree-label"><Icon name="layers" size={15} /> Scene <span>800 × 600</span></div>
      <div className="object-list" role="listbox" aria-label="Scene objects">
        {actors.map((actor, index) => (
          <button
            className={`object-item ${actor.id === selectedActorId ? 'selected' : ''}`}
            type="button"
            key={actor.id}
            role="option"
            aria-selected={actor.id === selectedActorId}
            onClick={() => onSelect(actor.id)}
          >
            <span className={`object-thumb object-thumb-${actor.image}`}><ActorArt image={actor.image} size={31} /></span>
            <span className="object-copy"><strong>{actor.name}</strong><small>{actor.image}</small></span>
            <span className="object-order">{String(index + 1).padStart(2, '0')}</span>
          </button>
        ))}
        {actors.length === 0 && (
          <div className="empty-objects">
            <span className="empty-icon"><Icon name="cursor" size={19} /></span>
            <strong>Nothing here yet</strong>
            <span>Add an actor to start building your scene.</span>
          </div>
        )}
      </div>

      <button className="add-actor-button" type="button" onClick={onAdd} disabled={disabled}>
        <Icon name="plus" size={17} /> Add actor
      </button>

      <div className="object-panel-foot"><span className="live-dot" /> Autosaves in this browser</div>
    </aside>
  );
}
