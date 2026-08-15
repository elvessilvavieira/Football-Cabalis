import Link from "next/link";
import { ArrowLeft, CalendarDays, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";
import { GameCard } from "@/components/GameCard";
import { StandingsTable } from "@/components/StandingsTable";
import { getSeason, getSeasons } from "@/lib/data";

export function generateStaticParams() { return getSeasons().map(({ id }) => ({ id })); }

export default async function TemporadaPage({ params }: { params: Promise<{ id: string }> }) {
  const season = getSeason((await params).id);
  if (!season) notFound();
  return <main>
    <section className="page-hero season-detail-hero"><div className="container"><Link className="back-link" href="/temporadas"><ArrowLeft size={16} /> Todas as temporadas</Link><span className="eyebrow"><span /> TEMPORADA</span><h1>{season.label}</h1><p>{season.games.length} {season.games.length === 1 ? "partida disputada" : "partidas disputadas"}</p></div></section>
    <section className="container content-section"><div className="section-heading"><div><span className="section-kicker"><TrendingUp size={15} /> CLASSIFICAÇÃO FINAL</span><h2>Classificação geral</h2></div><p>Vitória <b>3 pts</b> · Empate <b>1 pt</b> · Derrota <b>0 pt</b></p></div><StandingsTable standings={season.standings} /></section>
    <section className="season-games-section"><div className="container"><div className="section-heading"><div><span className="section-kicker"><CalendarDays size={15} /> PARTIDAS</span><h2>Jogos da temporada</h2></div></div><div className="season-games">{season.games.map((game) => <GameCard game={game} key={game.id} />)}</div></div></section>
  </main>;
}
