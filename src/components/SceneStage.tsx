import { useRef } from 'react';
import type { PointerEvent, KeyboardEvent, ReactNode } from 'react';
import type { GameActor } from '../types/game';
import { ActorArt } from './ActorArt';
import { Icon } from './Icon';

interface SceneStageProps {
  width: number;
  height: number;
  actors: GameActor[];
  selectedActorId: string | null;
  playing: boolean;
  showScore: boolean;
  score: number;
  children?: ReactNode;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

export function SceneStage({ width, height, actors, selectedActorId, playing, showScore, score, children, onSelect, onMove }: SceneStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ actorId: string; pointerId: number } | null>(null);
  const selected = actors.find((actor) => actor.id === selectedActorId) ?? null;

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>, actorId: string) {
    if (playing) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(actorId);
    dragRef.current = { actorId, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || !stage || playing) return;
    const rect = stage.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * width);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * height);
    onMove(drag.actorId, Math.max(0, Math.min(width, x)), Math.max(0, Math.min(height, y)));
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (playing || !selected) return;
    const amount = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-amount, 0], ArrowRight: [amount, 0], ArrowUp: [0, -amount], ArrowDown: [0, amount],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onMove(selected.id, Math.max(0, Math.min(width, selected.x + move[0])), Math.max(0, Math.min(height, selected.y + move[1])));
  }

  return (
    <section className="scene-panel panel" aria-labelledby="scene-heading">
      <div className="scene-header">
        <div className="scene-heading-copy">
          <div className="scene-title-line"><span className="scene-icon"><Icon name="layers" size={16} /></span><h2 id="scene-heading">Game scene</h2><span className="scene-dimensions">{width} × {height}</span></div>
          <p>{playing ? 'Preview running · use your arrow keys to play' : 'Drag objects to arrange your game world'}</p>
        </div>
        <div className={`scene-mode ${playing ? 'scene-mode-playing' : ''}`}><span />{playing ? 'Preview' : 'Design mode'}</div>
      </div>

      <div className="scene-content">
        <div className="stage-column">
          <div className={`stage-wrap ${playing ? 'stage-wrap-playing' : ''}`}>
            <div
              ref={stageRef}
              className="game-stage"
              style={{ aspectRatio: `${width} / ${height}` }}
              onPointerMove={handlePointerMove}
              onPointerUp={() => { dragRef.current = null; }}
              onPointerCancel={() => { dragRef.current = null; }}
              onKeyDown={handleStageKeyDown}
              tabIndex={playing ? -1 : 0}
              aria-label={playing ? 'Game preview' : 'Game scene. Select and drag actors. Use arrow keys to nudge the selected actor, or Shift and arrow keys to move by ten pixels.'}
              aria-readonly={playing}
            >
              <div className="stage-background-glow" />
              <div className="stage-watermark">GAME SCENE</div>
              {actors.filter((actor) => actor.visible).map((actor) => (
                <button
                  key={actor.id}
                  className={`stage-actor ${actor.id === selectedActorId ? 'stage-actor-selected' : ''} ${playing ? 'stage-actor-playing' : ''}`}
                  type="button"
                  style={{ left: `${(actor.x / width) * 100}%`, top: `${(actor.y / height) * 100}%`, transform: `translate(-50%, -50%) rotate(${actor.angle}deg)` }}
                  onClick={() => onSelect(actor.id)}
                  onPointerDown={(event) => handlePointerDown(event, actor.id)}
                  aria-label={`${actor.name}, ${actor.image}, x ${actor.x}, y ${actor.y}`}
                  title={`${actor.name} · ${actor.x}, ${actor.y}`}
                  tabIndex={-1}
                >
                  <span className={`actor-art actor-art-${actor.image}`}><ActorArt image={actor.image} size={52} /></span>
                  <span className="actor-name-tag">{actor.name}</span>
                </button>
              ))}
              {showScore && <div className="score-chip"><span className="score-star"><ActorArt image="coin" size={19} /></span><span>Score</span><strong>{score}</strong></div>}
              {actors.length === 0 && <div className="stage-empty"><span className="stage-empty-mark"><Icon name="plus" size={21} /></span><strong>Your game starts here</strong><span>Add an actor, then drag it onto the scene.</span></div>}
              <div className="stage-coordinate-badge">{selected ? `X ${selected.x}  ·  Y ${selected.y}` : 'Scene ready'}</div>
            </div>
          </div>
          <div className="stage-hint"><Icon name="cursor" size={14} /><span>{playing ? 'Arrow keys move the selected player' : 'Drag to position · select and use arrow keys to nudge'}</span></div>
        </div>
        <div className="scene-inspector-wrap">
          {children}
        </div>
      </div>
    </section>
  );
}
