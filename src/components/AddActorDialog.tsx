import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ActorImage } from '../types/game';
import { ACTOR_IMAGES } from '../types/game';
import { ActorArt } from './ActorArt';
import { Icon } from './Icon';

export interface NewActorValues {
  name: string;
  image: ActorImage;
  x: number;
  y: number;
}

interface AddActorDialogProps {
  onClose: () => void;
  onAdd: (actor: NewActorValues) => void;
}

const DEFAULT_NAMES: Record<ActorImage, string> = { spaceship: 'player', alien: 'enemy', coin: 'coin', ball: 'ball' };
const IMAGE_LABELS: Record<ActorImage, string> = { spaceship: 'Spaceship', alien: 'Alien', coin: 'Coin', ball: 'Ball' };

export function AddActorDialog({ onClose, onAdd }: AddActorDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const [image, setImage] = useState<ActorImage>('spaceship');
  const [name, setName] = useState('player');
  const [x, setX] = useState(150);
  const [y, setY] = useState(300);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onAdd({ name: trimmedName, image, x: Math.max(0, Math.min(800, x)), y: Math.max(0, Math.min(600, y)) });
  }

  return (
    <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="add-dialog" role="dialog" aria-modal="true" aria-labelledby="add-dialog-title">
        <div className="dialog-top"><div><span className="dialog-mark"><Icon name="plus" size={19} /></span><div><p className="eyebrow">SCENE OBJECT</p><h2 id="add-dialog-title">Add an actor</h2></div></div><button type="button" className="icon-button subtle" aria-label="Close dialog" onClick={onClose}><Icon name="close" size={18} /></button></div>
        <p className="dialog-intro">Choose a character and give it a starting position in your game.</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="new-actor-name">Actor name</label>
          <input id="new-actor-name" className="text-field" value={name} autoFocus maxLength={24} onChange={(event) => setName(event.target.value)} placeholder="e.g. player" required />

          <span className="field-label actor-type-heading">Image / type</span>
          <div className="actor-choice-grid" role="radiogroup" aria-label="Choose actor image">
            {ACTOR_IMAGES.map((item) => (
              <button type="button" key={item} role="radio" aria-checked={image === item} className={`actor-choice ${image === item ? 'actor-choice-selected' : ''}`} onClick={() => { setImage(item); setName((current) => current === DEFAULT_NAMES.spaceship || Object.values(DEFAULT_NAMES).includes(current as never) ? DEFAULT_NAMES[item] : current); }}>
                <span className={`choice-art choice-art-${item}`}><ActorArt image={item} size={38} /></span><span>{IMAGE_LABELS[item]}</span>{image === item && <span className="choice-check"><Icon name="check" size={12} /></span>}
              </button>
            ))}
          </div>

          <div className="dialog-position-heading"><span className="field-label">Starting position</span><span className="dialog-position-hint">Scene is 800 × 600</span></div>
          <div className="position-fields dialog-position-fields">
            <label className="number-field"><span>X</span><input type="number" min="0" max="800" value={x} onChange={(event) => setX(Number(event.target.value) || 0)} /></label>
            <label className="number-field"><span>Y</span><input type="number" min="0" max="600" value={y} onChange={(event) => setY(Number(event.target.value) || 0)} /></label>
          </div>
          <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Icon name="plus" size={16} /> Add actor</button></div>
        </form>
      </section>
    </div>
  );
}
