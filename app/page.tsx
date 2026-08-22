import Link from "next/link";
import { ArrowRight, CalendarDays, TrendingUp } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { StandingsTable } from "@/components/StandingsTable";
import { TeamStandingsTable } from "@/components/TeamStandingsTable";
import { TopScorersTable } from "@/components/TopScorersTable";
import { games, getCurrentSeason } from "@/lib/data";

export default function Home() {
  const season = getCurrentSeason();
  const lastGame = season.games[0];
  const totalGoals = games.reduce((sum, game) => sum + game.teamA.score + game.teamB.score, 0);
  const totalPlayers = new Set(games.flatMap((game) => [
    ...game.teamA.players.map(({ playerId }) => playerId),
    ...game.teamB.players.map(({ playerId }) => playerId),
  ])).size;
  const topScorers = [...season.standings]
    .filter((row) => row.goalsScored > 0)
    .sort((a, b) => b.goalsScored - a.goalsScored || a.player.name.localeCompare(b.player.name));
  return <main>
    <section className="hero"><div className="hero-pattern" /><div className="container hero-content">
      <h1>O jogo acaba.<br /><em>A história fica.</em></h1><p>Resultados, golos e a classificação oficial da nossa pelada.</p>
      <div className="hero-stats"><div><strong>{games.length}</strong><span>partidas</span></div><div><strong>{totalGoals}</strong><span>golos</span></div><div><strong>{totalPlayers}</strong><span>jogadores</span></div></div>
    </div></section>
    <section className="container content-section standings-section">
      <div className="section-heading"><div><span className="section-kicker"><TrendingUp size={15} /> TEMPORADA ATUAL</span><h2>Classificação de {season.label}</h2></div><p>Vitória <b>3 pts</b> · Empate <b>1 pt</b> · Derrota <b>0 pt</b></p></div>
      <StandingsTable standings={season.standings} />
      <div className="team-standings-heading"><span className="section-kicker"><TrendingUp size={15} /> TIMES</span><h2>Classificação de times de {season.label}</h2></div>
      <TeamStandingsTable standings={season.teamStandings} />
      {topScorers.length > 0 && <><div className="team-standings-heading"><span className="section-kicker"><TrendingUp size={15} /> GOLOS</span><h2>Melhores marcadores de {season.label}</h2></div><TopScorersTable scorers={topScorers} /></>}
    </section>
    <section className="latest-section"><div className="container">
      <div className="section-heading light"><div><span className="section-kicker"><CalendarDays size={15} /> ÚLTIMA PARTIDA</span><h2>Resultado do último jogo</h2></div><Link className="text-link" href={`/temporadas/${season.id}`}>Ver temporada completa <ArrowRight size={17} /></Link></div>
      <GameCard game={lastGame} featured />
    </div></section>
  </main>;
}
