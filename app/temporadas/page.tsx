import Link from "next/link";
import { ArrowRight, CalendarDays, Crown, Medal, Target, Trophy } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getSeasons } from "@/lib/data";

export default function TemporadasPage() {
  const seasons = getSeasons();
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow"><span /> HISTÓRICO MENSAL</span><h1>Temporadas</h1><p>Os melhores jogadores, times campeões, pódios, jogos e rankings de cada mês.</p></div></section>
    <section className="container seasons-grid">{seasons.map((season, seasonIndex) => {
      const podium = season.standings.slice(0, 3);
      const championTeam = season.teamStandings[0];
      const topScorer = [...season.standings]
        .filter((row) => row.goalsScored > 0)
        .sort((a, b) => b.goalsScored - a.goalsScored || a.player.name.localeCompare(b.player.name))[0];
      return <Link className="season-card" href={`/temporadas/${season.id}`} key={season.id}>
        <div className="season-card-heading"><span className="season-icon"><CalendarDays size={20} /></span><span><small>{seasonIndex === 0 ? "Temporada atual" : "Temporada encerrada"}</small><strong>{season.label}</strong></span><ArrowRight size={20} /></div>
        <div className="champion"><Crown size={22} /><PlayerAvatar player={podium[0].player} size="lg" /><span><small>Melhor jogador</small><strong>{podium[0].player.name}</strong><em>{podium[0].points} pontos</em></span></div>
        <div className="podium-list">{podium.slice(1).map((row, index) => <div key={row.player.id}><span className={`position position-${index + 2}`}><Medal size={16} /></span><PlayerAvatar player={row.player} size="sm" /><strong>{row.player.name}</strong><small>{index === 0 ? "Prata" : "Bronze"}</small><b>{row.points} pts</b></div>)}</div>
        <div className="season-awards">
          <div className="season-award season-award-team"><span className="season-award-icon" style={{ backgroundColor: championTeam.hex }}><Trophy size={20} /></span><span className="season-award-copy"><small>Time campeão</small><strong>Time {championTeam.label}</strong></span><span className="season-award-value"><b>{championTeam.points}</b><small>pontos</small></span></div>
          {topScorer && <div className="season-award season-award-scorer"><span className="scorer-award-avatar"><PlayerAvatar player={topScorer.player} size="lg" /><i><Target size={12} /></i></span><span className="season-award-copy"><small>Melhor marcador</small><strong>{topScorer.player.name}</strong></span><span className="season-award-value"><b>{topScorer.goalsScored}</b><small>{topScorer.goalsScored === 1 ? "golo" : "golos"}</small></span></div>}
        </div>
        <p>{season.games.length} {season.games.length === 1 ? "partida" : "partidas"}</p>
      </Link>;
    })}</section>
  </main>;
}
