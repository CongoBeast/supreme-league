import React from 'react';
import './fpl-squad-pitch.css';

const positionOrder = ['GKP', 'DEF', 'MID', 'FWD'];
const positionNames = { GKP: 'Goalkeeper', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards' };

function Player({ player, bench = false }) {
  const position = String(player.position || 'MID').toUpperCase();
  const initials = String(player.club || player.name || '?').slice(0, 3).toUpperCase();
  return (
    <div className={`fpl-player fpl-player--${position.toLowerCase()} ${bench ? 'fpl-player--bench' : ''}`}>
      <div className="fpl-player__shirt" aria-hidden="true"><span>{initials}</span></div>
      <div className="fpl-player__name" title={player.name}>{player.name}</div>
      <div className="fpl-player__meta">
        <span>{player.club || position}</span><strong>{Number(player.points || 0)} pts</strong>
      </div>
      <div className="fpl-player__badges">
        {player.isCaptain && <span className="fpl-player__badge fpl-player__badge--captain">C</span>}
        {player.isViceCaptain && <span className="fpl-player__badge fpl-player__badge--vice">V</span>}
        {Number(player.multiplier || 0) > 1 && <span className="fpl-player__multiplier">×{player.multiplier}</span>}
      </div>
    </div>
  );
}

export default function FplSquadPitch({ lineup = [], gameweek, compact = false }) {
  const starters = lineup.filter((player) => player.starter);
  const bench = lineup.filter((player) => !player.starter);
  if (!lineup.length) return null;

  return (
    <div className={`fpl-squad ${compact ? 'fpl-squad--compact' : ''}`}>
      <div className="fpl-squad__pitch" aria-label={`FPL starting lineup${gameweek ? ` for gameweek ${gameweek}` : ''}`}>
        <div className="fpl-squad__centre-line" aria-hidden="true" />
        <div className="fpl-squad__centre-circle" aria-hidden="true" />
        {positionOrder.map((position) => {
          const players = starters.filter((player) => String(player.position || '').toUpperCase() === position);
          if (!players.length) return null;
          return (
            <section className="fpl-squad__row" key={position} aria-label={positionNames[position]}>
              {players.map((player) => <Player player={player} key={player.elementId || `${position}-${player.name}`} />)}
            </section>
          );
        })}
      </div>
      {bench.length > 0 && (
        <div className="fpl-squad__bench-wrap">
          <div className="fpl-squad__bench-label">Bench</div>
          <div className="fpl-squad__bench">
            {bench.map((player) => <Player player={player} bench key={player.elementId || `bench-${player.name}`} />)}
          </div>
        </div>
      )}
    </div>
  );
}
