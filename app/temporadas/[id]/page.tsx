import Link from "next/link";
import { ArrowLeft, CalendarDays, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";
import { GameCard } from "@/components/GameCard";
import { StandingsTable } from "@/components/StandingsTable";
import { TeamStandingsTable } from "@/components/TeamStandingsTable";
import { TopScorersTable } from "@/components/TopScorersTable";
import { getSeason, getSeasons } from "@/lib/data";

export function generateStaticParams() { return getSeasons().map(({ id }) => ({ id })); }

export default async function TemporadaPage({ params }: { params: Promise<{ id: string }> }) {
  const season = getSeason((await params).id);
  if (!season) notFound();
  const topScorers = [...season.standings]
    .filter((row) => row.goalsScored > 0)
    .sort((a, b) => b.goalsScored - a.goalsScored || a.player.name.localeCompare(b.player.name));
  return <main>
    <section className="page-hero season-detail-hero"><div className="container"><Link className="back-link" href="/temporadas"><ArrowLeft size={16} /> Todas as temporadas</Link><span className="eyebrow"><span /> TEMPORADA</span><h1>{season.label}</h1><p>{season.games.length} {season.games.length === 1 ? "partida disputada" : "partidas disputadas"}</p></div></section>
    <section className="container content-section"><div className="section-heading"><div><span className="section-kicker"><TrendingUp size={15} /> RANKING FINAL</span><h2>Ranking de jogadores</h2></div><p>Vitória <b>3 pts</b> · Empate <b>1 pt</b> · Derrota <b>0 pt</b></p></div><StandingsTable standings={season.standings} /><div className="team-standings-heading"><span className="section-kicker"><TrendingUp size={15} /> TIMES</span><h2>Classificação de times</h2></div><TeamStandingsTable standings={season.teamStandings} />{topScorers.length > 0 && <><div className="team-standings-heading"><span className="section-kicker"><TrendingUp size={15} /> GOLOS</span><h2>Melhores marcadores</h2></div><TopScorersTable scorers={topScorers} /></>}</section>
    <section className="season-games-section"><div className="container"><div className="section-heading"><div><span className="section-kicker"><CalendarDays size={15} /> PARTIDAS</span><h2>Jogos da temporada</h2></div></div><div className="season-games">{season.games.map((game) => <GameCard game={game} key={game.id} />)}</div></div></section>
  </main>;
}
