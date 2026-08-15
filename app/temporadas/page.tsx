import Link from "next/link";
import { ArrowRight, CalendarDays, Crown, Medal } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getSeasons } from "@/lib/data";

export default function TemporadasPage() {
  const seasons = getSeasons();
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow"><span /> HISTÓRICO MENSAL</span><h1>Temporadas</h1><p>Todos os campeões, pódios, jogos e classificações de cada mês.</p></div></section>
    <section className="container seasons-grid">{seasons.map((season, seasonIndex) => {
      const podium = season.standings.slice(0, 3);
      return <Link className="season-card" href={`/temporadas/${season.id}`} key={season.id}>
        <div className="season-card-heading"><span className="season-icon"><CalendarDays size={20} /></span><span><small>{seasonIndex === 0 ? "Temporada atual" : "Temporada encerrada"}</small><strong>{season.label}</strong></span><ArrowRight size={20} /></div>
        <div className="champion"><Crown size={22} /><PlayerAvatar player={podium[0].player} size="lg" /><span><small>Campeão</small><strong>{podium[0].player.name}</strong><em>{podium[0].points} pontos</em></span></div>
        <div className="podium-list">{podium.slice(1).map((row, index) => <div key={row.player.id}><span className={`position position-${index + 2}`}><Medal size={16} /></span><PlayerAvatar player={row.player} size="sm" /><strong>{row.player.name}</strong><small>{index === 0 ? "Prata" : "Bronze"}</small><b>{row.points} pts</b></div>)}</div>
        <p>{season.games.length} {season.games.length === 1 ? "partida" : "partidas"}</p>
      </Link>;
    })}</section>
  </main>;
}
