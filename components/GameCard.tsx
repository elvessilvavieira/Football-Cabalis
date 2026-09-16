import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { captainciesForPlayer, Game, getCaptaincies, getPlayers, teamColors, type Captaincy, type Player } from "@/lib/data";
import { PlayerAvatar } from "./PlayerAvatar";

function TeamRoster({ team, players, captaincies }: { team: Game["teamA"]; players: Player[]; captaincies: Captaincy[] }) {
  return (
    <div className="roster">
      <Link className="roster-title team-link" href={`/time/${team.color}`}><span className="color-dot" style={{ background: teamColors[team.color].hex }} />Time {teamColors[team.color].label}</Link>
      <div className="roster-list">
        {team.players.map(({ playerId, goals }) => {
          const player = players.find((candidate) => candidate.id === playerId)!;
          return (
            <Link className="roster-player player-link" href={`/jogador/${playerId}`} key={playerId}>
              <PlayerAvatar player={player} size="sm" captaincies={captainciesForPlayer(captaincies, playerId).filter(({ teamColor }) => teamColor === team.color)} />
              <span>{player.name}</span>
              {goals > 0 && <em>{goals} {goals === 1 ? "golo" : "golos"}</em>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export async function GameCard({ game, featured = false }: { game: Game; featured?: boolean }) {
  const [players, captaincies] = await Promise.all([getPlayers(), getCaptaincies()]);
  const date = new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(game.date));
  return (
    <article className={`game-card ${featured ? "game-card-featured" : ""}`}>
      <div className="score-area">
        <div className="team-score">
          <span className="team-swatch" style={{ background: teamColors[game.teamA.color].hex }} />
          <Link className="team-link" href={`/time/${game.teamA.color}`}><strong>Time {teamColors[game.teamA.color].label}</strong></Link>
          <b>{game.teamA.score}</b>
        </div>
        <span className="score-divider">—</span>
        <div className="team-score team-score-away">
          <b>{game.teamB.score}</b>
          <Link className="team-link" href={`/time/${game.teamB.color}`}><strong>Time {teamColors[game.teamB.color].label}</strong></Link>
          <span className="team-swatch" style={{ background: teamColors[game.teamB.color].hex }} />
        </div>
      </div>
      <div className="game-meta">
        <span><CalendarDays size={15} />{date}</span>
        {game.venue && <span><MapPin size={15} />{game.venue}</span>}
      </div>
      <div className="rosters"><TeamRoster team={game.teamA} players={players} captaincies={captaincies} /><TeamRoster team={game.teamB} players={players} captaincies={captaincies} /></div>
    </article>
  );
}
