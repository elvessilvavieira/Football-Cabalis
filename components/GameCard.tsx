import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { Game, getPlayers, teamColors, type Player } from "@/lib/data";
import { PlayerAvatar } from "./PlayerAvatar";

function TeamRoster({ team, players }: { team: Game["teamA"]; players: Player[] }) {
  return (
    <div className="roster">
      <div className="roster-title"><span className="color-dot" style={{ background: teamColors[team.color].hex }} />Time {teamColors[team.color].label}</div>
      <div className="roster-list">
        {team.players.map(({ playerId, goals }) => {
          const player = players.find((candidate) => candidate.id === playerId)!;
          return (
            <Link className="roster-player player-link" href={`/jogador/${playerId}`} key={playerId}>
              <PlayerAvatar player={player} size="sm" />
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
  const players = await getPlayers();
  const date = new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(game.date));
  return (
    <article className={`game-card ${featured ? "game-card-featured" : ""}`}>
      <div className="score-area">
        <div className="team-score">
          <span className="team-swatch" style={{ background: teamColors[game.teamA.color].hex }} />
          <strong>Time {teamColors[game.teamA.color].label}</strong>
          <b>{game.teamA.score}</b>
        </div>
        <span className="score-divider">—</span>
        <div className="team-score team-score-away">
          <b>{game.teamB.score}</b>
          <strong>Time {teamColors[game.teamB.color].label}</strong>
          <span className="team-swatch" style={{ background: teamColors[game.teamB.color].hex }} />
        </div>
      </div>
      <div className="game-meta">
        <span><CalendarDays size={15} />{date}</span>
        {game.venue && <span><MapPin size={15} />{game.venue}</span>}
      </div>
      <div className="rosters"><TeamRoster team={game.teamA} players={players} /><TeamRoster team={game.teamB} players={players} /></div>
    </article>
  );
}
