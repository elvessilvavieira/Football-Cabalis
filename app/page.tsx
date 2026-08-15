import Link from "next/link";
import { ArrowRight, CalendarDays, TrendingUp } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { StandingsTable } from "@/components/StandingsTable";
import { getCurrentSeason, players } from "@/lib/data";

export default function Home() {
  const season = getCurrentSeason();
  const lastGame = season.games[0];
  const totalGoals = season.games.reduce((sum, game) => sum + game.teamA.score + game.teamB.score, 0);
  return <main>
    <section className="hero"><div className="hero-pattern" /><div className="container hero-content">
      <span className="eyebrow"><span /> TEMPORADA {season.label.toUpperCase()}</span>
      <h1>O jogo acaba.<br /><em>A história fica.</em></h1><p>Resultados, golos e a classificação oficial da nossa pelada.</p>
      <div className="hero-stats"><div><strong>{season.games.length}</strong><span>partidas</span></div><div><strong>{totalGoals}</strong><span>golos</span></div><div><strong>{players.length}</strong><span>jogadores</span></div></div>
    </div></section>
    <section className="container content-section standings-section">
      <div className="section-heading"><div><span className="section-kicker"><TrendingUp size={15} /> TEMPORADA ATUAL</span><h2>Classificação de {season.label}</h2></div><p>Vitória <b>3 pts</b> · Empate <b>1 pt</b> · Derrota <b>0 pt</b></p></div>
      <StandingsTable standings={season.standings} />
    </section>
    <section className="latest-section"><div className="container">
      <div className="section-heading light"><div><span className="section-kicker"><CalendarDays size={15} /> ÚLTIMA PARTIDA</span><h2>Resultado do último jogo</h2></div><Link className="text-link" href={`/temporadas/${season.id}`}>Ver temporada completa <ArrowRight size={17} /></Link></div>
      <GameCard game={lastGame} featured />
    </div></section>
  </main>;
}
