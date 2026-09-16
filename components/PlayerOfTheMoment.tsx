import Link from "next/link";
import { ArrowRight, Crown, Flame, Target, Trophy } from "lucide-react";
import type { Game, Standing } from "@/lib/data";
import { PlayerAvatar } from "./PlayerAvatar";

type RecentAppearance = {
  game: Game;
  result: "win" | "draw" | "loss";
};

function getRecentAppearances(games: Game[], playerId: string): RecentAppearance[] {
  return games.flatMap((game) => {
    const sides = [
      { team: game.teamA, opponent: game.teamB },
      { team: game.teamB, opponent: game.teamA },
    ];
    const side = sides.find(({ team }) => team.players.some((player) => player.playerId === playerId));
    if (!side) return [];

    const result: RecentAppearance["result"] = side.team.score > side.opponent.score
      ? "win"
      : side.team.score < side.opponent.score
        ? "loss"
        : "draw";
    return [{
      game,
      result,
    }];
  }).slice(0, 5);
}

export function PlayerOfTheMoment({ leader, games, seasonLabel }: { leader: Standing; games: Game[]; seasonLabel: string }) {
  const recentAppearances = getRecentAppearances(games, leader.player.id);
  const winRate = leader.games ? Math.round((leader.wins / leader.games) * 100) : 0;

  return (
    <section className="moment-section" aria-labelledby="moment-title">
      <div className="moment-heading">
        <div>
          <span className="section-kicker"><Flame size={15} /> DESTAQUE DA TEMPORADA</span>
          <h2 id="moment-title">Jogador do Momento</h2>
        </div>
        <span className="moment-season">{seasonLabel}</span>
      </div>

      <article className="moment-card">
        <div className="moment-player">
          <div className="moment-player-avatar">
            <PlayerAvatar player={leader.player} size="lg" />
            <span className="moment-crown" aria-label="Primeiro no ranking"><Crown size={19} fill="currentColor" /></span>
          </div>
          <div className="moment-player-copy">
            <span className="moment-rank">LÍDER DO RANKING</span>
            <h3>{leader.player.name}</h3>
            <p>Em grande forma e no topo da classificação de {seasonLabel}.</p>
            {recentAppearances.length > 0 && <div className="moment-form">
              <small>Últimos jogos</small>
              <div>{recentAppearances.map((appearance) => <span className={`form-dot form-${appearance.result}`} title={appearance.result === "win" ? "Vitória" : appearance.result === "draw" ? "Empate" : "Derrota"} key={appearance.game.id}>{appearance.result === "win" ? "V" : appearance.result === "draw" ? "E" : "D"}</span>)}</div>
            </div>}
            <Link href={`/jogador/${leader.player.id}`}>Ver perfil completo <ArrowRight size={16} /></Link>
          </div>
        </div>

        <div className="moment-stats" aria-label="Estatísticas do jogador na temporada">
          <div><span><Trophy size={17} /></span><strong>{leader.points}</strong><small>pontos</small></div>
          <div><span><Target size={17} /></span><strong>{leader.goalsScored}</strong><small>golos</small></div>
          <div><span><Crown size={17} /></span><strong>{leader.wins}</strong><small>vitórias</small></div>
          <div><span><Flame size={17} /></span><strong>{winRate}%</strong><small>aproveitamento</small></div>
          <p>Na temporada <b>{seasonLabel}</b></p>
        </div>

      </article>
    </section>
  );
}
